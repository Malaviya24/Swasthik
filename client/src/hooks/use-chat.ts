import { useState, useCallback } from 'react';
import { ChatMessage, sendChatMessage } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `🙏 Namaste! I'm your Swasthya Mitra (Health Friend). I'm here to help you with:

• Health questions & symptoms
• Medicine information  
• First aid guidance
• Finding nearby clinics
• Health reminders

**Important:** I provide general health information only. Always consult a qualified healthcare professional for medical advice.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'voice' = 'text') => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      messageType,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(content, messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: `🙏 Namaste! I'm your Swasthya Mitra (Health Friend). I'm here to help you with:

• Health questions & symptoms
• Medicine information  
• First aid guidance
• Finding nearby clinics
• Health reminders

**Important:** I provide general health information only. Always consult a qualified healthcare professional for medical advice.`,
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
