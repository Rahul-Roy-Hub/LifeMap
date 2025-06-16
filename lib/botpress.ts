import { supabase } from './supabase';

interface WeeklySummary {
  summary: string;
  insights: string[];
  moodAnalysis: {
    averageMood: number;
    moodTrend: string;
    suggestions: string[];
    moodDistribution: {
      [key: number]: number; // mood score -> count
    };
  };
  habitAnalysis: {
    completedHabits: {
      [key: string]: number; // habit name -> completion count
    };
    topHabits: string[];
    habitSuggestions: string[];
  };
  productivityAnalysis: {
    averageProductivity: number;
    productivityTrend: string;
    recommendations: string[];
  };
  goalsProgress: {
    completed: number;
    inProgress: number;
    suggestions: string[];
  };
  nextWeekRecommendations: {
    focusAreas: string[];
    actionItems: string[];
    habitGoals: string[];
  };
}

export class BotpressService {
  private static instance: BotpressService;
  // Use the correct IP address for your network
  private readonly API_URL = 'http://192.168.0.115:3001/api/botpress';

  private constructor() {}

  public static getInstance(): BotpressService {
    if (!BotpressService.instance) {
      BotpressService.instance = new BotpressService();
    }
    return BotpressService.instance;
  }

  async generateWeeklySummary(userId: string, startDate: Date, endDate: Date): Promise<WeeklySummary> {
    try {
      console.log('Generating weekly summary for user:', userId);
      console.log('Date range:', { startDate, endDate });
      console.log('Using API URL:', this.API_URL);

      // Fetch journal entries for the week
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (entriesError) {
        console.error('Error fetching journal entries:', entriesError);
        throw new Error(`Failed to fetch journal entries: ${entriesError.message}`);
      }

      console.log('Fetched journal entries:', entries?.length || 0);

      // Initialize empty arrays for goals and habits
      let goals: any[] = [];
      let habits: any[] = [];

      // Try to fetch goals if the table exists
      try {
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (!goalsError) {
          goals = goalsData || [];
          console.log('Fetched goals:', goals.length);
        } else {
          console.warn('Goals table might not exist:', goalsError.message);
        }
      } catch (error) {
        console.warn('Error fetching goals:', error);
      }

      // Try to fetch habits if the table exists
      try {
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (!habitsError) {
          habits = habitsData || [];
          console.log('Fetched habits:', habits.length);
        } else {
          console.warn('Habits table might not exist:', habitsError.message);
        }
      } catch (error) {
        console.warn('Error fetching habits:', error);
      }

      // Prepare data for analysis
      const analysisData = {
        type: 'weekly_summary',
        userId,
        data: {
          journalEntries: entries?.map(entry => ({
            content: entry.content,
            mood: entry.mood,
            productivity: entry.productivity,
            created_at: entry.created_at
          })) || [],
          goals,
          habits
        }
      };

      console.log('Prepared analysis data:', {
        entriesCount: analysisData.data.journalEntries.length,
        goalsCount: analysisData.data.goals.length,
        habitsCount: analysisData.data.habits.length
      });

      // Call our proxy server
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analysis API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate analysis');
      }

      const summary = await response.json();
      console.log('Received summary from analysis API');

      // Process and enhance the summary with local calculations
      const moodDistribution = this.calculateMoodDistribution(entries || []);
      const habitAnalysis = this.analyzeHabits(habits);
      const goalsProgress = this.analyzeGoalsProgress(goals);

      const enhancedSummary = {
        ...summary,
        moodAnalysis: {
          ...summary.moodAnalysis,
          moodDistribution
        },
        habitAnalysis,
        goalsProgress,
        nextWeekRecommendations: this.generateNextWeekRecommendations(summary, habitAnalysis, goalsProgress)
      };

      console.log('Generated enhanced summary');
      return enhancedSummary;
    } catch (error) {
      console.error('Error in generateWeeklySummary:', error);
      throw new Error(`Failed to generate weekly summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateMoodDistribution(entries: any[]): { [key: number]: number } {
    const distribution: { [key: number]: number } = {};
    entries.forEach(entry => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });
    return distribution;
  }

  private analyzeHabits(habits: any[]): any {
    const completedHabits: { [key: string]: number } = {};
    const topHabits: string[] = [];
    const habitSuggestions: string[] = [];

    habits.forEach(habit => {
      if (habit.completed) {
        completedHabits[habit.name] = (completedHabits[habit.name] || 0) + 1;
      }
    });

    // Sort habits by completion count
    const sortedHabits = Object.entries(completedHabits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    topHabits.push(...sortedHabits.map(([name]) => name));

    // Generate suggestions based on habit completion patterns
    if (sortedHabits.length > 0) {
      habitSuggestions.push(
        `Focus on maintaining your consistency with ${topHabits[0]}`,
        `Consider adding more variety to your routine`,
        `Track your progress with habit streaks`
      );
    }

    return {
      completedHabits,
      topHabits,
      habitSuggestions
    };
  }

  private analyzeGoalsProgress(goals: any[]): any {
    const completed = goals.filter(goal => goal.status === 'completed').length;
    const inProgress = goals.filter(goal => goal.status === 'in_progress').length;
    
    const suggestions = [];
    if (completed > 0) {
      suggestions.push('Great job completing your goals!');
    }
    if (inProgress > 0) {
      suggestions.push('Keep working on your in-progress goals');
    }
    if (completed === 0 && inProgress === 0) {
      suggestions.push('Consider setting some new goals for next week');
    }

    return {
      completed,
      inProgress,
      suggestions
    };
  }

  private generateNextWeekRecommendations(
    summary: any,
    habitAnalysis: any,
    goalsProgress: any
  ): any {
    // Default values for when data is missing
    const defaultMoodAnalysis = {
      averageMood: 0,
      moodTrend: 'neutral',
      suggestions: []
    };

    const defaultHabitAnalysis = {
      completedHabits: {},
      topHabits: [] as string[],
      habitSuggestions: []
    };

    const defaultGoalsProgress = {
      completed: 0,
      inProgress: 0,
      suggestions: []
    };

    // Use provided data or defaults
    const moodAnalysis = summary?.moodAnalysis || defaultMoodAnalysis;
    const habits = habitAnalysis || defaultHabitAnalysis;
    const goals = goalsProgress || defaultGoalsProgress;

    const focusAreas: string[] = [];
    const actionItems: string[] = [];
    const habitGoals: string[] = [];

    // Mood-based recommendations
    if (moodAnalysis.averageMood < 3) {
      focusAreas.push('Improve mood and emotional well-being');
      actionItems.push('Schedule time for activities you enjoy');
      actionItems.push('Practice mindfulness or meditation');
    }

    // Habit-based recommendations
    if (habits.topHabits.length === 0) {
      focusAreas.push('Establish new positive habits');
      habitGoals.push('Start with one small habit and build consistency');
    } else {
      habits.topHabits.forEach((habit: string) => {
        habitGoals.push(`Maintain consistency with ${habit}`);
      });
    }

    // Goal-based recommendations
    if (goals.completed === 0 && goals.inProgress === 0) {
      focusAreas.push('Set clear goals for the week');
      actionItems.push('Define 2-3 specific, achievable goals');
    } else if (goals.inProgress > 0) {
      focusAreas.push('Focus on completing in-progress goals');
      actionItems.push('Break down larger goals into smaller tasks');
    }

    // Add general recommendations if we don't have enough specific ones
    if (focusAreas.length < 2) {
      focusAreas.push('Maintain work-life balance');
      focusAreas.push('Prioritize self-care and rest');
    }

    if (actionItems.length < 2) {
      actionItems.push('Review and adjust your daily routine');
      actionItems.push('Track your progress regularly');
    }

    if (habitGoals.length < 2) {
      habitGoals.push('Stay consistent with your daily routines');
      habitGoals.push('Celebrate small wins and progress');
    }

    return {
      focusAreas: focusAreas.slice(0, 3),
      actionItems: actionItems.slice(0, 3),
      habitGoals: habitGoals.slice(0, 3)
    };
  }
} 