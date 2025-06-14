import { supabase } from './supabase';

interface WeeklySummary {
  summary: string;
  insights: string[];
  moodAnalysis: {
    averageMood: number;
    moodTrend: string;
    suggestions: string[];
  };
}

export class BotpressService {
  private static instance: BotpressService;
  private readonly BOTPRESS_API_URL = 'https://api.botpress.cloud/v1';
  private readonly BOTPRESS_API_KEY = process.env.EXPO_PUBLIC_BOTPRESS_API_KEY;

  private constructor() {}

  public static getInstance(): BotpressService {
    if (!BotpressService.instance) {
      BotpressService.instance = new BotpressService();
    }
    return BotpressService.instance;
  }

  async generateWeeklySummary(userId: string, startDate: Date, endDate: Date): Promise<WeeklySummary> {
    try {
      // Fetch journal entries for the week
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Prepare data for Botpress
      const journalData = entries.map(entry => ({
        content: entry.content,
        mood: entry.mood,
        created_at: entry.created_at
      }));

      // Call Botpress API for analysis
      const response = await fetch(`${this.BOTPRESS_API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.BOTPRESS_API_KEY}`
        },
        body: JSON.stringify({
          type: 'weekly_summary',
          data: journalData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate weekly summary');
      }

      const summary = await response.json();
      return summary;
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      throw error;
    }
  }
} 