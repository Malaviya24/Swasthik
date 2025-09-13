import { useState, useRef } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { analyzeImage } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string, type?: 'text' | 'image' | 'voice') => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    { icon: 'fas fa-thermometer-half', label: 'Check Fever', action: () => onSendMessage('I have a fever. What should I do?') },
    { icon: 'fas fa-pills', label: 'Medicine Info', action: () => onSendMessage('I need information about a medication.') },
    { icon: 'fas fa-band-aid', label: 'First Aid', action: () => onSendMessage('I need first aid guidance for an emergency.') },
    { icon: 'fas fa-hospital', label: 'Find Clinic', action: () => onSendMessage('Help me find nearby health centers.') },
  ];

  return (
    <div className="p-4 border-t border-border bg-card">
      {/* Quick Actions */}
      <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={disabled}
            className="flex items-center space-x-2 bg-muted hover:bg-muted/80 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors disabled:opacity-50"
            data-testid={`button-quick-${action.label.toLowerCase().replace(' ', '-')}`}
          >
            <i className={action.icon}></i>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Message Input Area */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 bg-background border border-input rounded-2xl p-3">
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Type your health question..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || isUploading}
              className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground disabled:opacity-50"
              data-testid="input-message"
            />
            
            {/* Attachment Options */}
            <div className="flex items-center space-x-1">
              {/* Image Upload */}
              <label className={`cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <i className="fas fa-camera text-muted-foreground"></i>
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
              <VoiceRecorder onTranscript={handleVoiceTranscript} />
            </div>
          </div>
        </div>
        
        {/* Send Button */}
        <button 
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          className="bg-primary text-primary-foreground p-3 rounded-full hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-send-message"
        >
          {isUploading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </div>
    </div>
  );
}
