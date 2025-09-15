import { useSpeech } from '@/hooks/use-speech';
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useSpeech();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // NEW ChatGPT Style UI - This should definitely work!
  console.log('🎤 VoiceInput: NEW ChatGPT Style UI loaded - Timestamp:', new Date().toISOString());
  console.log('🎤 VoiceInput: Version 5.0 - FORCE RELOAD');
  console.log('🎤 VoiceInput: If you see this, the new UI is working!');

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast({
        title: "Recording Started",
        description: "Speak clearly for better transcription. Click Send when finished.",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      let errorMessage = "Unable to start recording.";
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          errorMessage = "Microphone permission denied. Please allow microphone access and try again.";
        } else if (error.message.includes('NotFound')) {
          errorMessage = "No microphone found. Please check your audio device.";
        } else if (error.message.includes('NotSupported')) {
          errorMessage = "Voice recording is not supported in your browser.";
        }
      }
      
      toast({
        title: "Recording Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    setIsProcessing(true);
    try {
      const transcript = await stopRecording();
      if (transcript && transcript.trim()) {
        onTranscript(transcript);
        toast({
          title: "Message Transcribed",
          description: "Your voice message has been converted to text and sent.",
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try recording again and speak more clearly.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      
      toast({
        title: "Transcription Failed",
        description: "Unable to convert speech to text. Please try typing your message instead.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
    toast({
      title: "Recording Cancelled",
      description: "Voice recording was cancelled.",
    });
  };

  // ChatGPT-style horizontal voice input bar
  if (!isRecording && !isProcessing) {
    return (
      <motion.button
        onClick={handleStartRecording}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center hover:scale-105 border-4 border-green-500"
        data-testid="button-start-recording"
        title="🎤 NEW ChatGPT Style v5.0 - Start voice recording"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className={`fas fa-microphone text-lg ${isHovered ? 'text-blue-600' : 'text-gray-600'}`} />
      </motion.button>
    );
  }

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center bg-gray-800 rounded-2xl px-4 py-3 min-w-[300px] border-2 border-blue-500"
      >
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-white text-sm">🔄 Processing your voice...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-gray-800 rounded-2xl px-4 py-3 min-w-[300px] border-2 border-red-500"
    >
      {/* Microphone Icon */}
      <div className="flex items-center mr-4">
        <motion.div
          className="w-3 h-3 bg-red-500 rounded-full mr-2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <i className="fas fa-microphone text-white text-sm" />
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-end space-x-1 flex-1 mr-4">
        {[2, 4, 3, 6, 2, 5, 3, 4, 2, 6, 3, 5, 2, 4, 3, 6, 2, 5, 3, 4, 2, 6, 3, 5, 2, 4, 3, 6, 2, 5].map((height, index) => (
          <motion.div
            key={index}
            className="w-1 bg-white rounded-full"
            style={{ height: `${height * 2}px` }}
            animate={{ 
              height: [`${height * 2}px`, `${height * 3}px`, `${height * 2}px`],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 0.8 + Math.random() * 0.4, 
              repeat: Infinity, 
              delay: index * 0.05,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Cancel Button */}
        <motion.button
          onClick={handleCancelRecording}
          className="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-700 flex items-center justify-center transition-all duration-200"
          data-testid="button-cancel-recording"
          title="Cancel recording"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="fas fa-times text-white text-xs" />
        </motion.button>

        {/* Send Button */}
        <motion.button
          onClick={handleStopRecording}
          className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all duration-200"
          data-testid="button-stop-recording"
          title="Send recording"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="fas fa-check text-white text-xs" />
        </motion.button>
      </div>
    </motion.div>
  );
}
