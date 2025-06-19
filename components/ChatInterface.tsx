import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ChatService } from '../lib/chatService';

// Add a simple robot icon component
const BotIcon = () => (
  <View style={styles.botIconContainer}>
    <Text style={styles.botIcon}>🤖</Text>
  </View>
);

interface Message {
  type: 'text';
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatService = ChatService.getInstance();

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      type: 'text',
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await chatService.sendMessage(userMessage.text);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        type: 'text',
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render rich text (bullets, emojis) for bot messages
  const renderBotText = (text: string) => {
    // Simple bullet/emoji support
    return text.split('\n').map((line, idx) => {
      if (line.trim().startsWith('•')) {
        return (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
            <Text style={styles.bullet}>{'• '}</Text>
            <Text style={styles.botMessageText}>{line.trim().substring(1).trim()}</Text>
          </View>
        );
      }
      return <Text key={idx} style={styles.botMessageText}>{line}</Text>;
    });
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';
    return (
      <View
        key={index}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.botMessageRow,
        ]}
      >
        {!isUser && <BotIcon />}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          {isUser ? (
            <Text style={styles.userMessageText}>{message.text}</Text>
          ) : (
            renderBotText(message.text)
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <FontAwesome
            name="send"
            size={20}
            color={!inputText.trim() || isLoading ? '#94a3b8' : '#3b82f6'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '100%',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  botIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  botIcon: {
    fontSize: 20,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 18,
    maxWidth: 320,
    minWidth: 60,
  },
  userMessageBubble: {
    backgroundColor: '#e0edff',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  botMessageBubble: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessageText: {
    fontSize: 16,
    color: '#222',
  },
  botMessageText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
  bullet: {
    fontSize: 16,
    color: '#222',
    marginRight: 4,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: 8,
    alignItems: 'center',
  },
}); 