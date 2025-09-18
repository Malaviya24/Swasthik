import { ChatMessage } from './gemini';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatHistoryService {
  private static readonly STORAGE_KEY = 'swasthik_chat_history';
  private static readonly MAX_SESSIONS = 50; // Limit to prevent storage bloat

  static saveSession(session: ChatSession): void {
    try {
      const existingSessions = this.getSessions();
      const updatedSessions = [session, ...existingSessions.filter(s => s.id !== session.id)]
        .slice(0, this.MAX_SESSIONS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }

  static getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  static getSession(id: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(session => session.id === id) || null;
  }

  static deleteSession(id: string): void {
    try {
      const sessions = this.getSessions();
      const updatedSessions = sessions.filter(session => session.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  }

  static clearAllSessions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat sessions:', error);
    }
  }

  static generateSessionTitle(messages: ChatMessage[]): string {
    // Find the first user message to use as title
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content;
      // Truncate to 50 characters and add ellipsis if needed
      return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }
    return 'New Chat';
  }

  static createSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
