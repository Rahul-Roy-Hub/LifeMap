import { AIService } from './ai-service';

export interface ChatMessage {
  type: 'text';
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export class ChatService {
  private static instance: ChatService;
  private aiService = AIService.getInstance();

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
    try {
      const aiResponse = await this.aiService.processInput(userMessage);
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