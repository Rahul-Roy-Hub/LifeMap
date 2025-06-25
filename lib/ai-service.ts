import { supabase } from './supabase';
import type { ChatMessage } from './chatService';

// Use your computer's local IP address instead of localhost
const API_URL = 'http://192.168.0.115:5000/api/chat';

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
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      console.log('Current user ID:', userId);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          user_id: userId
        }),
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
      console.log('Generating weekly summary with params:', { 
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // First, get the user's entries from Supabase
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      console.log('Supabase fetch result:', { 
        entries: entries?.length || 0,
        entriesError,
        sampleEntry: entries?.[0] 
      });

      // Debug: Let's also check if there are ANY entries for this user
      const { data: allEntries, error: allEntriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('All entries for user:', {
        count: allEntries?.length || 0,
        error: allEntriesError,
        sampleEntries: allEntries?.slice(0, 2).map(e => ({
          id: e.id,
          created_at: e.created_at,
          content: e.content?.substring(0, 50) + '...'
        }))
      });

      if (entriesError) {
        console.error('Supabase error:', entriesError);
        throw entriesError;
      }

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

      // Create a prompt for the AI Coach
      const prompt = `Here are this user's journal entries for the week (as JSON):\n${JSON.stringify(formattedEntries, null, 2)}\n\nPlease provide a LifeMap Weekly Summary with:\n- Mood trend\n- Productivity average\n- Best/worst days\n- Positive suggestions\n- Friendly, motivational tone with emojis.\nIf there is not enough data, say so in a supportive way.`;

      // Send to backend AI Coach endpoint
      const API_URL = 'http://192.168.0.115:5000/api/chat';  // Updated to use the actual server IP
      console.log('Sending weekly summary request to:', API_URL, { message: prompt, user_id: userId });
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: prompt, user_id: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to generate weekly summary',
      };
    }
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
    try {
      const aiResponse = await this.processInput(userMessage);
      let text: string;
      if (typeof aiResponse.result === 'string') {
        text = aiResponse.result;
      } else if (aiResponse.result && typeof aiResponse.result === 'object') {
        // Format the summary object into a chat-friendly string
        text = aiResponse.result.summary || "Here's your summary!";
        if (aiResponse.result.insights) {
          text += '\n\n' + aiResponse.result.insights.join('\n');
        }
        // Optionally add more fields (moodAnalysis, goalsProgress, etc.)
      } else {
        text = "Sorry, I couldn't generate a response. Please try again.";
      }
      return {
        type: 'text',
        text,
        sender: 'bot',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error sending message to PICA AI:', error);
      return {
        type: 'text',
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
    }
  }
} 