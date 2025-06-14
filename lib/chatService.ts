interface ChatMessage {
  type: 'text';
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export class ChatService {
  private static instance: ChatService;
  private readonly WEBHOOK_URL = 'https://webhook.botpress.cloud/5f58b70b-632a-4a5b-b1ce-c05709184f9f';

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
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