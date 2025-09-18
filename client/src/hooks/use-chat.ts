import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, sendChatMessage } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChatHistoryService, ChatSession } from '@/lib/chatHistory';

export function useChat() {
  const { currentLanguage, translate } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
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
    setCurrentSessionId(null);
  }, [translate]);

  const loadSession = useCallback((session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
  }, []);

  const saveCurrentSession = useCallback(() => {
    if (messages.length > 1) { // Don't save if only welcome message
      const sessionId = currentSessionId || ChatHistoryService.createSessionId();
      const title = ChatHistoryService.generateSessionTitle(messages);
      
      const session: ChatSession = {
        id: sessionId,
        title,
        messages,
        createdAt: currentSessionId ? ChatHistoryService.getSession(sessionId)?.createdAt || new Date() : new Date(),
        updatedAt: new Date(),
      };
      
      ChatHistoryService.saveSession(session);
      setCurrentSessionId(sessionId);
    }
  }, [messages, currentSessionId]);

  // Auto-save session when messages change
  useEffect(() => {
    if (messages.length > 1) {
      const timeoutId = setTimeout(saveCurrentSession, 2000); // Debounce save
      return () => clearTimeout(timeoutId);
    }
  }, [messages, saveCurrentSession]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    loadSession,
    currentSessionId,
  };
}
