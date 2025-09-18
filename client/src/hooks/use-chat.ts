import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, sendChatMessage } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function useChat() {
  const { currentLanguage, translate } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize with welcome message in current language
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: translate('chat.welcome_message'),
    }]);
  }, [currentLanguage, translate]);

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'voice' = 'text', imageFile?: File) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      messageType,
      metadata: imageFile ? { fileName: imageFile.name, fileSize: imageFile.size } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(content, messages, currentLanguage, imageFile);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: translate('common.error'),
        description: translate('chat.error_message'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast, currentLanguage, translate]);

  const clearChat = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: translate('chat.welcome_message'),
    }]);
  }, [translate]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
