import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/gemini';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isHealthTipVisible, setIsHealthTipVisible] = useState(true);
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set());
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLongResponse = (content: string) => {
    // Consider a response long if it's over 500 words or has multiple sections
    const wordCount = content.split(/\s+/).length;
    const hasMultipleSections = content.includes('###') || content.includes('**Assessment**') || content.includes('**Immediate Action**');
    return wordCount > 500 || hasMultipleSections;
  };

  const generateSummary = (content: string) => {
    // Extract key sections for summary
    const lines = content.split('\n');
    const summary: string[] = [];
    
    // Look for key sections
    const keySections = [
      'Quick Summary',
      'Assessment',
      'Immediate Action',
      'Medicine Guide',
      'What to Expect in Hospital',
      'Long-term Prevention'
    ];
    
    let currentSection = '';
    let inSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line starts a key section
      const sectionMatch = keySections.find(section => 
        trimmedLine.includes(section) || trimmedLine.startsWith('**' + section + '**')
      );
      
      if (sectionMatch) {
        currentSection = sectionMatch;
        inSection = true;
        summary.push(`**${sectionMatch}:**`);
        continue;
      }
      
      // If we're in a section and this line has content, add it to summary
      if (inSection && trimmedLine && !trimmedLine.startsWith('###') && !trimmedLine.startsWith('**')) {
        // Take only the first 1-2 sentences of each section
        const sentences = trimmedLine.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length > 0) {
          summary.push(sentences[0].trim() + (sentences[0].includes('.') ? '' : '.'));
          if (sentences.length > 1 && summary.length < 8) {
            summary.push(sentences[1].trim() + (sentences[1].includes('.') ? '' : '.'));
          }
        }
        inSection = false; // Only take first few lines of each section
      }
    }
    
    // If no structured sections found, create a simple summary
    if (summary.length <= 2) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      summary.length = 0; // Clear existing
      summary.push('**Quick Summary:**');
      summary.push(sentences[0]?.trim() + (sentences[0]?.includes('.') ? '' : '.') || 'Please consult a healthcare professional for proper diagnosis and treatment.');
      if (sentences[1]) {
        summary.push(sentences[1].trim() + (sentences[1].includes('.') ? '' : '.'));
      }
    }
    
    return summary.join('\n');
  };

  const toggleSummary = (messageIndex: number) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(messageIndex)) {
      newExpanded.delete(messageIndex);
    } else {
      newExpanded.add(messageIndex);
    }
    setExpandedSummaries(newExpanded);
  };

  const copyToClipboard = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(messageIndex);
      toast({
        title: translate('chat.copy_success'),
        description: translate('chat.copy_success_desc'),
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: translate('common.error'),
        description: translate('chat.copy_error'),
        variant: "destructive",
      });
    }
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
            
            {/* Quick Test Call-to-Action */}
            <div className={`${isMobile ? 'mb-6' : 'mb-8'} bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-2xl ${isMobile ? 'p-4' : 'p-6'} max-w-md`}>
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-stethoscope text-white text-lg"></i>
                </div>
              </div>
              <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-800 mb-2`}>Quick Health Test</h4>
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} mb-4`}>
                Get instant health analysis based on your symptoms
              </p>
              <button 
                onClick={() => {
                  // This will be handled by the parent component
                  const event = new CustomEvent('openSymptomChecker');
                  window.dispatchEvent(event);
                }}
                className={`w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6'} rounded-lg transition-all duration-200 hover:scale-105 shadow-lg`}
              >
                <i className="fas fa-play mr-2"></i>
                Start Quick Test
              </button>
            </div>
            
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
                {/* Copy Button for All Messages */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-8 w-8 p-0 shadow-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-500 hover:bg-blue-600 border-blue-400 text-white' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => copyToClipboard(message.content, index)}
                    data-testid={`copy-button-${index}`}
                  >
                    <i className={`fas ${copiedMessageIndex === index ? 'fa-check text-green-600' : 'fa-copy'} text-xs ${
                      message.role === 'user' ? 'text-white' : 'text-gray-600'
                    }`}></i>
                  </Button>
                </div>
                
                <div className={`${isMobile ? 'p-3' : 'p-4'} rounded-3xl shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-lg' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-lg'
                }`}>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed space-y-2`}>
                    {/* Display image if message has image metadata */}
                    {message.metadata?.fileName && (
                      <div className={`mb-3 ${isMobile ? 'p-2' : 'p-3'} bg-gray-50 rounded-lg border border-gray-200`}>
                        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                          <i className={`fas fa-image text-blue-500 ${isMobile ? 'text-sm' : 'text-base'}`}></i>
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-medium truncate`}>
                            📷 {message.metadata.fileName}
                          </span>
                        </div>
                      </div>
                    )}
                    {formatMessage(message.content)}
                  </div>
                  
                  {/* Summary Button for Long AI Responses */}
                  {message.role === 'assistant' && isLongResponse(message.content) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => toggleSummary(index)}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          expandedSummaries.has(index)
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <i className={`fas ${expandedSummaries.has(index) ? 'fa-eye-slash' : 'fa-compress-alt'}`}></i>
                        {expandedSummaries.has(index) ? 'Hide Summary' : 'Show Summary'}
                      </button>
                      
                      {expandedSummaries.has(index) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="text-xs text-gray-700 leading-relaxed">
                            {formatMessage(generateSummary(message.content))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  
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
