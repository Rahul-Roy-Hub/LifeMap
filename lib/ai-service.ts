import { supabase } from './supabase';

// Use your computer's local IP address instead of localhost
const API_URL = 'http://192.168.0.115:5000/api/process-input'; // Replace with your actual IP address

export interface AIResponse {
  success: boolean;
  result: any;
  error?: string;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private handleError(error: any): AIResponse {
    console.error('Error details:', error);
    
    // Check for quota exceeded error
    if (error.message?.includes('insufficient_quota') || error.message?.includes('quota')) {
      return {
        success: false,
        result: null,
        error: 'AI service is temporarily unavailable. Please try again later or contact support.'
      };
    }

    // Check for API key error
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return {
        success: false,
        result: null,
        error: 'AI service configuration error. Please contact support.'
      };
    }

    // Generic error
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }

  async processInput(input: string): Promise<AIResponse> {
    try {
      console.log('Sending request to:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Error processing AI input:', error);
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to process input',
      };
    }
  }

  async generateWeeklySummary(userId: string, startDate: Date, endDate: Date): Promise<AIResponse> {
    try {
      console.log('Generating weekly summary for:', { userId, startDate, endDate });
      
      // First, get the user's entries from Supabase
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (entriesError) {
        console.error('Supabase error:', entriesError);
        throw entriesError;
      }

      console.log('Fetched entries:', entries);

      // If no entries found, return a friendly message
      if (!entries || entries.length === 0) {
        return {
          success: true,
          result: {
            summary: "No entries found for this week. Start by adding some journal entries!",
            insights: ["Add your first entry to get personalized insights"],
            moodAnalysis: {
              averageMood: 0,
              moodTrend: "neutral",
              suggestions: ["Start tracking your mood to see patterns over time"],
              moodDistribution: {}
            },
            habitAnalysis: {
              topHabits: [],
              habitSuggestions: ["Begin tracking your daily habits to see what works best for you"]
            },
            goalsProgress: {
              completed: 0,
              inProgress: 0,
              suggestions: ["Set your first goal to start tracking progress"]
            },
            nextWeekRecommendations: {
              focusAreas: ["Start with small, achievable goals"],
              actionItems: ["Add your first journal entry"],
              habitGoals: ["Begin tracking one daily habit"]
            }
          }
        };
      }

      // Format the entries for the AI
      const formattedEntries = entries.map(entry => ({
        date: entry.created_at,
        mood: entry.mood,
        content: entry.content,
        habits: entry.habits,
        productivity: entry.productivity
      }));

      // Create a detailed prompt for the AI
      const prompt = `Analyze the following weekly entries and provide a comprehensive summary:

Entries:
${JSON.stringify(formattedEntries, null, 2)}

Please provide:
1. Overall Summary: A brief overview of the week
2. Key Insights: 3-5 main takeaways from the entries
3. Mood Analysis:
   - Average mood score
   - Mood trend (improving/declining/stable)
   - Mood distribution
   - Suggestions for mood improvement
4. Habit Analysis:
   - Top performing habits
   - Suggestions for habit improvement
5. Goals Progress:
   - Number of completed goals
   - Number of in-progress goals
   - Suggestions for goal achievement
6. Next Week Recommendations:
   - Focus areas
   - Specific action items
   - Habit goals

Format the response as a JSON object with these exact keys:
{
  "summary": "string",
  "insights": ["string"],
  "moodAnalysis": {
    "averageMood": number,
    "moodTrend": "string",
    "suggestions": ["string"],
    "moodDistribution": {"mood_score": count}
  },
  "habitAnalysis": {
    "topHabits": ["string"],
    "habitSuggestions": ["string"]
  },
  "goalsProgress": {
    "completed": number,
    "inProgress": number,
    "suggestions": ["string"]
  },
  "nextWeekRecommendations": {
    "focusAreas": ["string"],
    "actionItems": ["string"],
    "habitGoals": ["string"]
  }
}`;

      console.log('Sending prompt to AI:', prompt);

      // Get AI response
      const response = await this.processInput(prompt);
      console.log('AI response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate summary');
      }

      return response;
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to generate weekly summary',
      };
    }
  }
} 