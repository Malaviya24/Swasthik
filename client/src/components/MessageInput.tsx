import { useState, useRef } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { analyzeImage } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  onSendMessage: (message: string, type?: 'text' | 'image' | 'voice') => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const analysis = await analyzeImage(file, "Please analyze this health-related image and provide medical guidance. Always include appropriate disclaimers about consulting healthcare professionals.");
      onSendMessage(`📷 Image uploaded and analyzed: ${analysis}`, 'image');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    onSendMessage(transcript, 'voice');
  };

  const quickActions = [
    { icon: 'fas fa-thermometer-half', label: 'Fever', color: 'text-red-600 bg-red-50 hover:bg-red-100', action: () => onSendMessage('I have a fever. What should I do?') },
    { icon: 'fas fa-pills', label: 'Medicine', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100', action: () => onSendMessage('I need information about a medication.') },
    { icon: 'fas fa-band-aid', label: 'First Aid', color: 'text-green-600 bg-green-50 hover:bg-green-100', action: () => onSendMessage('I need first aid guidance for an emergency.') },
    { icon: 'fas fa-hospital', label: 'Find Clinic', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100', action: () => onSendMessage('Help me find nearby health centers.') },
  ];

  return (
    <div className={isMobile ? 'p-3' : 'p-6'}>
      {/* Enhanced Quick Actions */}
      <div className={`flex ${isMobile ? 'space-x-2 mb-3' : 'space-x-3 mb-4'} overflow-x-auto pb-2`}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={disabled}
            className={`flex items-center ${isMobile ? 'space-x-1 px-3 py-2' : 'space-x-2 px-4 py-2.5'} rounded-2xl ${isMobile ? 'text-xs' : 'text-sm'} font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 disabled:opacity-50 ${action.color}`}
            data-testid={`button-quick-${action.label.toLowerCase().replace(' ', '-')}`}
          >
            <i className={`${action.icon} ${isMobile ? 'text-xs' : ''}`}></i>
            <span>{isMobile && action.label.includes(' ') ? action.label.split(' ')[0] : action.label}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Message Input Area */}
      <div className={`flex items-end ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
        <div className={`flex-1 bg-white border-2 border-gray-200 rounded-2xl ${isMobile ? 'p-3' : 'p-4'} shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all duration-200`}>
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <input 
              type="text" 
              placeholder={isMobile ? "Ask about health concerns..." : "Ask about symptoms, medicines, or health concerns..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || isUploading}
              className={`flex-1 bg-transparent outline-none ${isMobile ? 'text-xs' : 'text-sm'} placeholder-gray-500 disabled:opacity-50`}
              data-testid="input-message"
            />
            
            {/* Enhanced Attachment Options */}
            <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
              {/* Image Upload */}
              <label className={`cursor-pointer ${isMobile ? 'p-1.5' : 'p-2'} hover:bg-gray-100 rounded-xl transition-all duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}>
                <i className={`fas fa-camera text-gray-500 ${isMobile ? 'text-sm' : 'text-lg'}`}></i>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={disabled || isUploading}
                  data-testid="input-image-upload"
                />
              </label>
              
              {/* Voice Recording */}
              <div className={`${isMobile ? 'p-1.5' : 'p-2'} hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110`}>
                <VoiceRecorder onTranscript={handleVoiceTranscript} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Send Button */}
        <button 
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white ${isMobile ? 'p-3' : 'p-4'} rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl`}
          data-testid="button-send-message"
        >
          {isUploading ? (
            <i className={`fas fa-spinner fa-spin ${isMobile ? 'text-sm' : 'text-lg'}`}></i>
          ) : (
            <i className={`fas fa-paper-plane ${isMobile ? 'text-sm' : 'text-lg'}`}></i>
          )}
        </button>
      </div>
    </div>
  );
}
