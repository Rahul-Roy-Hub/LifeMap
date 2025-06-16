interface ChatMessage {
  type: 'text';
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export class ChatService {
  private static instance: ChatService;
  private readonly WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;

  private constructor() {
    if (!this.WEBHOOK_URL) {
      console.error('Botpress webhook URL is not configured. Please set EXPO_PUBLIC_BOTPRESS_WEBHOOK_URL in your environment variables.');
    }
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
    if (!this.WEBHOOK_URL) {
      throw new Error('Botpress webhook URL is not configured');
    }

    try {
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'text',
          text: userMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message to bot');
      }

      const result = await response.json();
      
      return {
        type: 'text',
        text: result.text || result.message || 'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
} 