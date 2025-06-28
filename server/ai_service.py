from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import traceback
import json
import requests
from dappier import Dappier
from supabase import create_client, Client
from datetime import datetime, timedelta

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

# Initialize Dappier
try:
    dappier = Dappier()
    logger.info("Dappier client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Dappier client: {str(e)}")
    dappier = None

LIFEMAP_SYSTEM_PROMPT = """
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
- On prompt like "/summary" or "how was my week?"
    return:
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

def fetch_dappier_data(query: str) -> dict:
    """
    Fetch data from Dappier API
    
    Args:
        query (str): The query to send to Dappier
        
    Returns:
        dict: The response from Dappier API
    """
    try:
        api_key = os.getenv("DAPPIER_API_KEY")
        if not api_key:
            raise ValueError("DAPPIER_API_KEY not found in environment variables")
            
        endpoint = "https://api.dappier.com/app/datamodel/dm_01jydzexekfhbvnmr18pjjvf7b"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        body = {"query": query}
        
        logger.info(f"Sending request to Dappier API with body: {body}")
        response = requests.post(endpoint, headers=headers, json=body)
        logger.info(f"Dappier API response status: {response.status_code}")
        logger.info(f"Dappier API response body: {response.text}")
        
        if response.status_code != 200:
            logger.error(f"Dappier API error: {response.text}")
            raise Exception(f"Dappier API returned status code {response.status_code}")
            
        return response.json()
        
    except Exception as e:
        logger.error(f"Error calling Dappier API: {str(e)}")
        raise

@app.route('/api/chat', methods=['POST'])
def chat():
    logger.info("DEBUG: /api/chat endpoint handler was called")
    logger.info(f"DEBUG: Current working directory: {os.getcwd()}")
    logger.info("Received request to /api/chat")
    try:
        data = request.json
        user_message = data.get('message')
        user_id = data.get('user_id')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Check if this is a weekly summary request (contains JSON data) or a regular chat
        summary_triggers = [
            "weekly summary", "how was my week", "give me my summary", "summary for this week", "week summary"
        ]
        is_summary_request = any(trigger in user_message.lower() for trigger in summary_triggers)

        if '[' in user_message and ']' in user_message:
            # Handle weekly summary (JSON data sent from frontend)
            try:
                # Extract the JSON part from the message
                json_start = user_message.find('[')
                json_end = user_message.find(']') + 1
                entries_json = user_message[json_start:json_end]
                entries = json.loads(entries_json)
                
                # Calculate statistics
                total_mood = sum(entry.get('mood', 0) for entry in entries)
                avg_mood = total_mood / len(entries) if entries else 0
                
                # Count completed habits
                habit_counts = {}
                for entry in entries:
                    habits = entry.get('habits', {})
                    for habit, completed in habits.items():
                        if completed:
                            habit_counts[habit] = habit_counts.get(habit, 0) + 1
                
                # Get top habits
                top_habits = sorted(habit_counts.items(), key=lambda x: x[1], reverse=True)[:3]
                
                # Generate response
                response = {
                    "success": True,
                    "result": {
                        "summary": f"Great week! Your mood has been consistently positive (average: {avg_mood:.1f}/5). 🌟",
                        "insights": [
                            f"You've maintained a positive outlook throughout the week! 😊",
                            f"Your most consistent habit was {top_habits[0][0] if top_habits else 'Reading'} ({top_habits[0][1] if top_habits else 0} times) 📈",
                            "You're building great momentum with your daily practices! 💪"
                        ],
                        "moodAnalysis": {
                            "averageMood": avg_mood,
                            "moodTrend": "positive" if avg_mood >= 4 else "neutral",
                            "suggestions": [
                                "Keep up the positive energy!",
                                "Consider adding meditation to your routine",
                                "Share your success with friends and family"
                            ],
                            "moodDistribution": {str(int(avg_mood)): len(entries)}
                        },
                        "habitAnalysis": {
                            "topHabits": [habit for habit, count in top_habits],
                            "habitSuggestions": [
                                "Try to maintain consistency with your top habits",
                                "Consider adding exercise to your routine",
                                "Start small with new habits"
                            ]
                        },
                        "goalsProgress": {
                            "completed": len([h for h, c in habit_counts.items() if c >= 3]),
                            "inProgress": len([h for h, c in habit_counts.items() if 0 < c < 3]),
                            "suggestions": [
                                "Set specific goals for next week",
                                "Break down larger goals into smaller tasks",
                                "Celebrate your progress!"
                            ]
                        },
                        "nextWeekRecommendations": {
                            "focusAreas": [
                                "Maintain your positive momentum",
                                "Build on your successful habits",
                                "Try one new healthy practice"
                            ],
                            "actionItems": [
                                "Set specific times for your habits",
                                "Track your progress daily",
                                "Reflect on what works best for you"
                            ],
                            "habitGoals": [
                                "Keep up with reading",
                                "Try adding a morning exercise routine",
                                "Practice mindfulness daily"
                            ]
                        }
                    }
                }
                
                return jsonify(response)
                
            except json.JSONDecodeError:
                logger.error("Failed to parse journal entries JSON")
                return jsonify({
                    'success': False,
                    'error': 'Failed to parse journal entries'
                }), 400
        elif is_summary_request:
            # Handle summary request from chat tab: fetch entries and return summary
            try:
                # Validate user_id
                if not user_id:
                    return jsonify({
                        'success': False,
                        'error': 'No user ID provided'
                    }), 400

                SUPABASE_URL = os.getenv("SUPABASE_URL")
                SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

                # Log all entries for this user (regardless of date) for debugging
                logger.info(f"Queried user_id: {user_id}")
                all_ids_resp = supabase.table("journal_entries").select("user_id").execute()
                all_ids = all_ids_resp.data if hasattr(all_ids_resp, 'data') else all_ids_resp.get("data", [])
                logger.info(f"ALL user_ids in journal_entries: {all_ids}")
                
                # Calculate start and end of the current week (Monday to Sunday)
                today = datetime.utcnow()
                start_of_week = today - timedelta(days=today.weekday())
                start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_week = start_of_week + timedelta(days=7)

                # Query only entries from this week
                entries_resp = supabase.table("journal_entries")\
                    .select("*")\
                    .eq("user_id", user_id)\
                    .gte("created_at", start_of_week.isoformat())\
                    .lt("created_at", end_of_week.isoformat())\
                    .execute()
                entries = entries_resp.data if hasattr(entries_resp, 'data') else entries_resp.get("data", [])
                logger.info(f"Entries fetched for user {user_id} this week: {entries}")
                
                # If no entries for this week, fetch the last 7 entries for the user
                if not entries:
                    recent_entries_resp = supabase.table("journal_entries")\
                        .select("*")\
                        .eq("user_id", user_id)\
                        .order("created_at", desc=True)\
                        .limit(7)\
                        .execute()
                    entries = recent_entries_resp.data if hasattr(recent_entries_resp, 'data') else recent_entries_resp.get("data", [])
                    logger.info(f"Last 7 entries for user {user_id}: {entries}")
                
                if not entries:
                    logger.info(f"NO entries found for user {user_id} after both queries. entries: {entries}")
                    return jsonify({
                        'success': True,
                        'result': "It seems I don't have any entries logged for this week yet! 📝 If you share how your days have been going—your mood, productivity, and any highlights—I can help create a summary for you. What was your mood like today? 😊"
                    })
                # ---
                total_mood = sum(entry.get('mood', 0) for entry in entries)
                avg_mood = total_mood / len(entries) if entries else 0
                habit_counts = {}
                for entry in entries:
                    habits = entry.get('habits', {})
                    for habit, completed in habits.items():
                        if completed:
                            habit_counts[habit] = habit_counts.get(habit, 0) + 1
                top_habits = sorted(habit_counts.items(), key=lambda x: x[1], reverse=True)[:3]
                response = {
                    "success": True,
                    "result": {
                        "summary": f"Great week! Your mood has been consistently positive (average: {avg_mood:.1f}/5). 🌟",
                        "insights": [
                            f"You've maintained a positive outlook throughout the week! 😊",
                            f"Your most consistent habit was {top_habits[0][0] if top_habits else 'Reading'} ({top_habits[0][1] if top_habits else 0} times) 📈",
                            "You're building great momentum with your daily practices! 💪"
                        ],
                        "moodAnalysis": {
                            "averageMood": avg_mood,
                            "moodTrend": "positive" if avg_mood >= 4 else "neutral",
                            "suggestions": [
                                "Keep up the positive energy!",
                                "Consider adding meditation to your routine",
                                "Share your success with friends and family"
                            ],
                            "moodDistribution": {str(int(avg_mood)): len(entries)}
                        },
                        "habitAnalysis": {
                            "topHabits": [habit for habit, count in top_habits],
                            "habitSuggestions": [
                                "Try to maintain consistency with your top habits",
                                "Consider adding exercise to your routine",
                                "Start small with new habits"
                            ]
                        },
                        "goalsProgress": {
                            "completed": len([h for h, c in habit_counts.items() if c >= 3]),
                            "inProgress": len([h for h, c in habit_counts.items() if 0 < c < 3]),
                            "suggestions": [
                                "Set specific goals for next week",
                                "Break down larger goals into smaller tasks",
                                "Celebrate your progress!"
                            ]
                        },
                        "nextWeekRecommendations": {
                            "focusAreas": [
                                "Maintain your positive momentum",
                                "Build on your successful habits",
                                "Try one new healthy practice"
                            ],
                            "actionItems": [
                                "Set specific times for your habits",
                                "Track your progress daily",
                                "Reflect on what works best for you"
                            ],
                            "habitGoals": [
                                "Keep up with reading",
                                "Try adding a morning exercise routine",
                                "Practice mindfulness daily"
                            ]
                        }
                    }
                }
                return jsonify(response)
            except Exception as e:
                logger.error(f"Failed to fetch or process journal entries: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'Failed to fetch or process journal entries'
                }), 500
        else:
            # Handle regular chat message using Dappier
            try:
                if dappier is None:
                    logger.error("Dappier client is not initialized")
                    return jsonify({
                        'success': False,
                        'error': 'Dappier service is not available. Please check API key configuration.'
                    }), 500
                
                logger.info(f"Sending query to Dappier: {user_message}")
                response = dappier.search_real_time_data_string(
                    query=user_message,
                    ai_model_id="am_01j06ytn18ejftedz6dyhz2b15"
                )
                logger.info(f"Dappier response received: {response}")
                return jsonify({
                    'success': True,
                    'result': response
                })
            except Exception as e:
                logger.error(f"Dappier chat error: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                return jsonify({
                    'success': False,
                    'error': f'Failed to process chat message: {str(e)}'
                }), 500

        # Fallback for any unhandled case
        return jsonify({'success': False, 'error': 'No valid response generated'}), 500

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/weekly-summary', methods=['GET'])
def weekly_summary():
    """
    Endpoint to fetch weekly summary using Dappier's analysis capabilities
    """
    logger.info("Received request to /api/weekly-summary")
    
    try:
        user_id = request.args.get('user_id')
        
        # Construct a detailed query for weekly summary
        query = {
            "type": "weekly_summary",
            "user_id": user_id,
            "request": {
                "mood_analysis": True,
                "productivity_metrics": True,
                "habit_tracking": True,
                "goals_progress": True,
                "recommendations": True
            }
        }
        
        # Get comprehensive analysis from Dappier
        response = fetch_dappier_data(json.dumps(query))
        
        return jsonify({
            'success': True,
            'result': response
        })
        
    except Exception as e:
        logger.error(f"Error in weekly summary endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    return jsonify({'status': 'ok'}), 200

@app.route('/api/weather')
def weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing lat or lon'}), 400

    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={os.environ.get("OPENWEATHERMAP_API_KEY", "your_real_api_key_here")}&units=metric'
    try:
        resp = requests.get(url)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """
    Debug endpoint to check environment variables and service status
    """
    try:
        debug_info = {
            'dappier_api_key_set': bool(os.getenv("DAPPIER_API_KEY")),
            'dappier_api_key_length': len(os.getenv("DAPPIER_API_KEY", "")),
            'dappier_client_initialized': dappier is not None,
            'supabase_url_set': bool(os.getenv("SUPABASE_URL")),
            'supabase_key_set': bool(os.getenv("SUPABASE_SERVICE_KEY")),
            'environment_variables': {
                'DAPPIER_API_KEY': '***' if os.getenv("DAPPIER_API_KEY") else 'NOT_SET',
                'SUPABASE_URL': os.getenv("SUPABASE_URL", 'NOT_SET'),
                'SUPABASE_SERVICE_KEY': '***' if os.getenv("SUPABASE_SERVICE_KEY") else 'NOT_SET'
            }
        }
        
        return jsonify({
            'success': True,
            'debug_info': debug_info
        })
        
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 