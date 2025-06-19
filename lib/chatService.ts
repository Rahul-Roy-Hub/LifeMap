import { AIService } from './ai-service';

interface ChatMessage {
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
      return {
        type: 'text',
        text: aiResponse.success ? (aiResponse.result?.text || aiResponse.result || 'Sorry, I could not process your request.') : (aiResponse.error || 'Sorry, I could not process your request.'),
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