from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType
from pica_langchain import PicaClient, create_pica_agent
import os
from dotenv import load_dotenv
import logging
import traceback
import json
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Pica client
pica_client = PicaClient(
    secret=os.getenv("PICA_API_KEY")
)

# System prompt for the LifeMap AI Coach
SYSTEM_PROMPT = """
You are LifeMap AI Coach – a supportive, friendly, and reflective personal growth assistant.

## Purpose
- Collect daily journal entries from users.
- Track their mood, emotions, productivity, and patterns over time.
- At the end of the week, summarize trends and provide personalized improvement suggestions.
- Act like a gentle coach, not a therapist or doctor.

## Tone & Style
- Encouraging, empathetic, and friendly.
- Use emojis to connect (😊, 📈, 💡).
- Short, clear responses with a human touch.
- Ask follow-ups to help the user reflect more.

## Responsibilities
- Accept inputs like: "I felt anxious today before work."
- Store key points (mood, notes, date).
- On prompt like "/summary" or "how was my week?", return:
    - Mood trend
    - Productivity average
    - Best/worst days
    - Positive suggestions

## Memory and Context
Use available memory or database to track per-user logs.
If memory not available, simulate best-effort summary from conversation.

## Example Interaction
User: I felt great today! Got a lot done.
Agent: That's awesome to hear! 😊 Want to tell me what made today productive?

User: Give me my weekly summary.
Agent:
Here's your LifeMap Weekly Summary:
📊 Mood Trend: Mostly positive
✅ Productivity: Average 7.5/10
🎯 Best Day: Wednesday – you crushed your to-do list!
💡 Suggestion: Try using the same morning routine from Wed every day!

Avoid advice that sounds clinical. Stick to motivation and reflection.

## Limitations
- Do not diagnose mental health.
- If a user is in distress, suggest talking to a professional.
"""

def get_deepseek_response(prompt: str) -> dict:
    """Get response from OpenRouter API"""
    try:
        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "HTTP-Referer": "https://lifemap.app",  # Your app's domain
            "X-Title": "LifeMap",  # Your app's name
            "Content-Type": "application/json"
        }
        
        # Create a more concise system prompt
        concise_system_prompt = """You are LifeMap AI Coach. Analyze user entries and provide a weekly summary in this JSON format:
{
  "summary": "Brief overview",
  "insights": ["key point 1", "key point 2"],
  "moodAnalysis": {
    "averageMood": number,
    "moodTrend": "improving/declining/stable",
    "suggestions": ["suggestion 1"],
    "moodDistribution": {"mood_score": count}
  },
  "habitAnalysis": {
    "topHabits": ["habit 1"],
    "habitSuggestions": ["suggestion 1"]
  },
  "goalsProgress": {
    "completed": number,
    "inProgress": number,
    "suggestions": ["suggestion 1"]
  },
  "nextWeekRecommendations": {
    "focusAreas": ["area 1"],
    "actionItems": ["item 1"],
    "habitGoals": ["goal 1"]
  }
}"""
        
        data = {
            "model": "anthropic/claude-3-opus",  # Using Claude model
            "messages": [
                {"role": "system", "content": concise_system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 100  # Reduced to stay within free tier limits
        }
        
        logger.info(f"Sending request to OpenRouter API with model: {data['model']}")
        logger.info(f"Request data: {json.dumps(data, indent=2)}")
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data
        )
        
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            error_text = response.text
            logger.error(f"OpenRouter API error: {error_text}")
            try:
                error_json = json.loads(error_text)
                error_message = error_json.get('error', {}).get('message', error_text)
            except:
                error_message = error_text
            raise Exception(f"OpenRouter API error: {error_message}")
            
        result = response.json()
        logger.info(f"OpenRouter API response: {json.dumps(result, indent=2)}")
        
        if 'choices' not in result or not result['choices']:
            raise Exception("No choices in API response")
            
        return result['choices'][0]['message']['content']
        
    except Exception as e:
        logger.error(f"Error calling OpenRouter API: {str(e)}")
        raise

@app.route('/api/process-input', methods=['POST', 'OPTIONS'])
def process_input():
    logger.info("Received request to /api/process-input")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        logger.info(f"Request data: {data}")
        
        user_input = data.get('input')
        
        if not user_input:
            logger.error("No input provided in request")
            return jsonify({'error': 'No input provided'}), 400

        # Get response from DeepSeek
        logger.info(f"Processing input: {user_input}")
        result = get_deepseek_response(user_input)
        logger.info(f"DeepSeek result: {result}")

        # Try to parse the result as JSON
        try:
            content = json.loads(result)
        except json.JSONDecodeError:
            # If not valid JSON, use the raw result
            content = result

        return jsonify({
            'success': True,
            'result': content
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    logger.info("Starting server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 