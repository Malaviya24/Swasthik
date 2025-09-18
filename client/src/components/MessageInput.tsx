import { useState, useRef } from 'react';
import { VoiceInput } from './VoiceInput';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  onSendMessage: (message: string, type?: 'text' | 'image' | 'voice', imageFile?: File) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSend = () => {
    if ((message.trim() || attachedImage) && !disabled) {
      const messageType = attachedImage ? 'image' : 'text';
      onSendMessage(message.trim() || 'Please analyze this image', messageType, attachedImage || undefined);
      setMessage('');
      setAttachedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Allow Enter to create new lines, only send on Shift+Enter or when clicking send button
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter sends the message (alternative to clicking send button)
      e.preventDefault();
      handleSend();
    }
    // Regular Enter key will create new line (default behavior)
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setAttachedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      {/* Voice Recording Bar (when active) */}
      <div className="mb-4">
        <VoiceInput onTranscript={handleVoiceTranscript} />
      </div>

      {/* Enhanced Quick Actions */}
      <div className={`flex ${isMobile ? 'space-x-2 mb-3' : 'space-x-3 mb-4'} overflow-x-auto pb-2 scrollbar-hide`}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={disabled}
            className={`flex items-center ${isMobile ? 'space-x-1 px-3 py-2 min-w-[80px]' : 'space-x-2 px-4 py-2.5'} rounded-2xl ${isMobile ? 'text-xs' : 'text-sm'} font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 disabled:opacity-50 ${action.color} touch-manipulation active:scale-95`}
            data-testid={`button-quick-${action.label.toLowerCase().replace(' ', '-')}`}
          >
            <i className={`${action.icon} ${isMobile ? 'text-sm' : ''}`}></i>
            <span className={isMobile ? 'text-xs' : ''}>{isMobile && action.label.includes(' ') ? action.label.split(' ')[0] : action.label}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Message Input Area */}
      <div className={`flex items-end ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
        <div className={`flex-1 bg-white border-2 border-gray-200 rounded-2xl ${isMobile ? 'p-3' : 'p-4'} shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all duration-200`}>
          {/* Image Preview */}
          {imagePreview && (
            <div className={`mb-3 ${isMobile ? 'p-2' : 'p-3'} bg-gray-50 rounded-lg border border-gray-200`}>
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'space-x-2 w-full' : 'space-x-2'}`}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} object-cover rounded-lg flex-shrink-0`}
                  />
                  <div className={`${isMobile ? 'flex-1 min-w-0' : ''}`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-medium truncate`}>
                      {attachedImage?.name}
                    </p>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                      {isMobile ? '📷 Image' : 'Image attached'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeImage}
                  className={`${isMobile ? 'p-2' : 'p-1'} text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0`}
                  title="Remove image"
                >
                  <i className={`fas fa-times ${isMobile ? 'text-sm' : 'text-xs'}`}></i>
                </button>
              </div>
            </div>
          )}
          
          <div className={`flex items-end ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <textarea 
              placeholder={
                attachedImage 
                  ? (isMobile ? "Add message... (Shift+Enter to send)" : "Add a message about this image... (Shift+Enter to send)")
                  : (isMobile ? "Ask about health... (Shift+Enter to send)" : "Ask about symptoms, medicines, or health concerns... (Shift+Enter to send)")
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={disabled || isUploading}
              rows={1}
              className={`flex-1 bg-transparent outline-none resize-none ${isMobile ? 'text-sm' : 'text-sm'} placeholder-gray-500 disabled:opacity-50 min-h-[24px] ${isMobile ? 'max-h-24' : 'max-h-32'} overflow-y-auto leading-relaxed`}
              data-testid="input-message"
              style={{ 
                height: 'auto',
                minHeight: isMobile ? '24px' : '20px',
                maxHeight: isMobile ? '96px' : '128px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                const maxHeight = isMobile ? 96 : 128;
                target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
              }}
            />
            
            {/* Enhanced Attachment Options */}
            <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'} flex-shrink-0`}>
              {/* Image Upload */}
              <label className={`cursor-pointer ${isMobile ? 'p-2' : 'p-2'} hover:bg-gray-100 rounded-xl transition-all duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${attachedImage ? 'text-blue-500 bg-blue-50' : 'text-gray-500'} touch-manipulation`}>
                <i className={`fas fa-camera ${isMobile ? 'text-base' : 'text-lg'}`}></i>
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
            </div>
          </div>
        </div>
        
        {/* Enhanced Send Button */}
        <button 
          onClick={handleSend}
          disabled={(!message.trim() && !attachedImage) || disabled || isUploading}
          className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white ${isMobile ? 'p-3 min-w-[44px] min-h-[44px]' : 'p-4'} rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl touch-manipulation active:scale-95`}
          data-testid="button-send-message"
        >
          {isUploading ? (
            <i className={`fas fa-spinner fa-spin ${isMobile ? 'text-base' : 'text-lg'}`}></i>
          ) : (
            <i className={`fas fa-paper-plane ${isMobile ? 'text-base' : 'text-lg'}`}></i>
          )}
        </button>
      </div>
    </div>
  );
}
