import { useSpeech } from '@/hooks/use-speech';
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useSpeech();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast({
        title: "Recording Started",
        description: "Speak clearly for better transcription. Tap 'Send' when finished.",
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

  if (!isRecording && !isProcessing) {
    return (
      <motion.button 
        onClick={handleStartRecording}
        className="relative p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group border border-blue-200"
        data-testid="button-start-recording"
        title="Record voice message - Click and speak clearly"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.i 
          className="fas fa-microphone text-blue-600 text-lg"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        />
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </motion.button>
    );
  }

  if (isProcessing) {
    return (
      <motion.div 
        className="mt-3 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg" 
        data-testid="voice-processing-ui"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center space-x-4">
          <motion.div 
            className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-800 mb-1">Processing your voice...</div>
            <div className="text-sm text-blue-600">Converting speech to text</div>
          </div>
        </div>
        <div className="mt-3 flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="mt-4 p-6 bg-gradient-to-br from-red-50 via-pink-50 to-red-50 border-2 border-red-200 rounded-3xl shadow-lg" 
      data-testid="voice-recording-ui"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="relative flex items-center justify-center">
            <motion.div 
              className="w-4 h-4 bg-red-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute w-8 h-8 border-2 border-red-300 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <div className="text-lg font-semibold text-red-700">Recording...</div>
            <div className="text-sm text-red-600">{Math.floor(Number(recordingTime) / 60)}:{(Number(recordingTime) % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button 
            onClick={handleCancelRecording}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm"
            data-testid="button-cancel-recording"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-times mr-2"></i>
            Cancel
          </motion.button>
          <motion.button 
            onClick={handleStopRecording}
            disabled={isProcessing}
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 rounded-full transition-all duration-200 shadow-lg flex items-center space-x-2"
            data-testid="button-stop-recording"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isProcessing ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                <span>Send</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Enhanced Audio Waveform Visualization */}
      <div className="flex items-center space-x-3 bg-white/30 rounded-2xl p-4">
        <div className="flex items-end space-x-1 flex-1">
          {[3, 5, 2, 6, 4, 7, 3, 5, 2, 6, 4, 3, 5, 7, 2, 4, 6, 3, 5, 2].map((height, index) => (
            <motion.div
              key={index}
              className="w-1.5 bg-gradient-to-t from-red-400 to-red-500 rounded-full"
              style={{ height: `${height * 4}px` }}
              animate={{ 
                height: [`${height * 4}px`, `${height * 6}px`, `${height * 4}px`],
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
        <div className="text-right min-w-0">
          <div className="text-sm font-medium text-red-700 mb-1">
            {Number(recordingTime) < 3 ? "🎤 Keep speaking..." : 
             Number(recordingTime) < 30 ? "✨ Speaking clearly" : 
             "⏰ Long message - consider sending"}
          </div>
          <div className="text-xs text-red-600">
            Tap Send when finished
          </div>
        </div>
      </div>
    </motion.div>
  );
}
