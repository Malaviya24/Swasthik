import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/gemini';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClearChat: () => void;
}

export function ChatInterface({ messages, isLoading, onClearChat }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { translate } = useLanguage();
  const isMobile = useIsMobile();
  const [isHealthTipVisible, setIsHealthTipVisible] = useState(true);

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
      {/* Enhanced Health Alert Banner */}
      {isHealthTipVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 ${isMobile ? 'p-3' : 'p-4'}`}
        >
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
            <div className={`flex items-center ${isMobile ? 'text-center' : ''}`}>
              <div className={`${isMobile ? 'w-6 h-6 mr-2' : 'w-8 h-8 mr-3'} bg-amber-100 rounded-full flex items-center justify-center`}>
                <i className={`fas fa-bell text-amber-600 ${isMobile ? 'text-xs' : ''}`}></i>
              </div>
              <div>
                <p className={`text-amber-900 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  Health Tip: Stay hydrated and maintain a balanced diet for better immunity
                </p>
                {!isMobile && (
                  <p className="text-amber-700 text-xs mt-1">Updated health guidelines available</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsHealthTipVisible(false)}
              className="text-amber-600 hover:text-amber-800 p-1 rounded transition-colors duration-200 hover:bg-amber-100" 
              data-testid="button-dismiss-alert"
              title="Dismiss health tip"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </motion.div>
      )}

      {/* Enhanced Chat Messages Area */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3 space-y-4' : 'p-6 space-y-6'} min-h-0 chat-scroll`}>
        {messages.length === 0 && (
          <div className={`flex flex-col items-center justify-center h-full text-center ${isMobile ? 'py-8' : 'py-12'}`}>
            <div className={`${isMobile ? 'w-16 h-16 mb-4' : 'w-20 h-20 mb-6'} bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl flex items-center justify-center`}>
              <i className={`fas fa-comments ${isMobile ? 'text-2xl' : 'text-3xl'} text-blue-600`}></i>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800 mb-2`}>{translate('chat.title')}</h3>
            <p className={`text-gray-600 ${isMobile ? 'mb-4 px-4' : 'mb-6'} max-w-md`}>{translate('chat.subtitle')}</p>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-2 max-w-xs' : 'grid-cols-2 gap-3'} text-sm`}>
              <div className={`bg-blue-50 ${isMobile ? 'p-2 flex items-center space-x-2' : 'p-3'} rounded-lg`}>
                <i className={`fas fa-stethoscope text-blue-600 ${isMobile ? 'text-sm' : 'mb-2'}`}></i>
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : ''}`}>{translate('nav.symptom_checker')}</p>
              </div>
              <div className={`bg-green-50 ${isMobile ? 'p-2 flex items-center space-x-2' : 'p-3'} rounded-lg`}>
                <i className={`fas fa-pills text-green-600 ${isMobile ? 'text-sm' : 'mb-2'}`}></i>
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : ''}`}>{translate('nav.medications')}</p>
              </div>
              <div className={`bg-purple-50 ${isMobile ? 'p-2 flex items-center space-x-2' : 'p-3'} rounded-lg`}>
                <i className={`fas fa-camera text-purple-600 ${isMobile ? 'text-sm' : 'mb-2'}`}></i>
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : ''}`}>Image Analysis</p>
              </div>
              <div className={`bg-orange-50 ${isMobile ? 'p-2 flex items-center space-x-2' : 'p-3'} rounded-lg`}>
                <i className={`fas fa-microphone text-orange-600 ${isMobile ? 'text-sm' : 'mb-2'}`}></i>
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : ''}`}>Voice Messages</p>
              </div>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex items-end ${isMobile ? 'space-x-2' : 'space-x-3'} ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${message.role}-${index}`}
            >
              {message.role === 'assistant' && (
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                  <i className={`fas fa-robot ${isMobile ? 'text-xs' : 'text-sm'}`}></i>
                </div>
              )}
              
              <div className={`group ${isMobile ? 'max-w-[85%]' : 'max-w-sm lg:max-w-lg xl:max-w-xl'} relative ${
                message.role === 'user' 
                  ? 'order-1' 
                  : 'order-2'
              }`}>
                <div className={`${isMobile ? 'p-3' : 'p-4'} rounded-3xl shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-lg' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-lg'
                }`}>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed space-y-2`}>
                    {formatMessage(message.content)}
                  </div>
                  
                  {message.messageType && message.messageType !== 'text' && (
                    <div className={`mt-3 text-xs flex items-center gap-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-blue-400' : 'bg-gray-100'
                      }`}>
                        <i className={`fas ${message.messageType === 'image' ? 'fa-image' : 'fa-microphone'} text-xs`}></i>
                      </div>
                      {message.messageType === 'image' ? 'Image analyzed' : 'Voice message'}
                    </div>
                  )}
                </div>
                
                <p className={`text-xs mt-1 px-3 ${
                  message.role === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-500'
                }`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <Avatar className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} flex-shrink-0 order-2`}>
                  <AvatarFallback className={`bg-gradient-to-br from-gray-600 to-gray-700 text-white ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end ${isMobile ? 'space-x-2' : 'space-x-3'} justify-start`}
          >
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
              <i className={`fas fa-robot ${isMobile ? 'text-xs' : 'text-sm'}`}></i>
            </div>
            <div className={`bg-white border border-gray-100 ${isMobile ? 'p-3' : 'p-4'} rounded-3xl rounded-tl-lg shadow-sm`}>
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
