import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/gemini';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClearChat: () => void;
}

export function ChatInterface({ messages, isLoading, onClearChat }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('• ')) {
        return <li key={index} className="ml-4">{line.substring(2)}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold">{line.slice(2, -2)}</p>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <>
      {/* Health Alert Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-amber-400 mr-3"></i>
            <p className="text-amber-800 text-sm">
              <strong>Health Alert:</strong> New vaccination guidelines released for children under 5. 
              <a href="#" className="underline hover:no-underline ml-1">Click to learn more</a>
            </p>
          </div>
          <button className="text-amber-600 hover:text-amber-800" data-testid="button-dismiss-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Chat Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h2 className="font-semibold">Swasthya Mitra AI</h2>
            <p className="text-sm text-muted-foreground">
              <span className="inline-block w-2 h-2 bg-accent rounded-full mr-2"></span>
              Online - Ready to help
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClearChat}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Clear chat"
            data-testid="button-clear-chat"
          >
            <i className="fas fa-trash text-muted-foreground"></i>
          </button>
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Settings"
            data-testid="button-settings"
          >
            <i className="fas fa-cog text-muted-foreground"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              data-testid={`message-${message.role}-${index}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <i className="fas fa-robot text-sm"></i>
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${
                message.role === 'user' 
                  ? 'chat-bubble-user text-primary-foreground rounded-tr-md' 
                  : 'chat-bubble-ai rounded-tl-md'
              }`}>
                <div className="text-sm space-y-1">
                  {formatMessage(message.content)}
                </div>
                {message.messageType && message.messageType !== 'text' && (
                  <div className="mt-2 text-xs opacity-75">
                    <i className={`fas ${message.messageType === 'image' ? 'fa-image' : 'fa-microphone'} mr-1`}></i>
                    {message.messageType === 'image' ? 'Image analyzed' : 'Voice message'}
                  </div>
                )}
                <p className="text-xs opacity-75 mt-2">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
