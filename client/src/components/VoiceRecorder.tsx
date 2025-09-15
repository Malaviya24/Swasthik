import { useSpeech } from '@/hooks/use-speech';
import { motion } from "framer-motion";
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
      <button 
        onClick={handleStartRecording}
        className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 group"
        data-testid="button-start-recording"
        title="Record voice message - Click and speak clearly"
      >
        <i className="fas fa-microphone text-gray-500 group-hover:text-blue-600 transition-colors"></i>
      </button>
    );
  }

  if (isProcessing) {
    return (
      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm" data-testid="voice-processing-ui">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-blue-700 font-medium">Processing your voice...</span>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-blue-600">Converting speech to text</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm" data-testid="voice-recording-ui">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-3 h-3 bg-red-500 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-sm text-red-700 font-medium">Recording... {recordingTime}</span>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCancelRecording}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg transition-colors"
            data-testid="button-cancel-recording"
          >
            Cancel
          </button>
          <button 
            onClick={handleStopRecording}
            disabled={isProcessing}
            className="text-sm text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
            data-testid="button-stop-recording"
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane text-xs"></i>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center space-x-1">
        {/* Audio Waveform Visualization */}
        <div className="flex items-end space-x-px mr-2">
          {[2, 4, 3, 5, 2, 4, 3, 2, 5, 3].map((height, index) => (
            <motion.div
              key={index}
              className="w-1 bg-red-400/70 rounded"
              style={{ height: `${height * 3}px` }}
              animate={{ height: [`${height * 3}px`, `${height * 5}px`, `${height * 3}px`] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.1 }}
            />
          ))}
        </div>
        <span className="text-xs text-red-600">
          {Number(recordingTime) < 3 ? "Keep speaking..." : Number(recordingTime) < 30 ? "Speak clearly for better transcription" : "Long message detected - consider sending soon"}
        </span>
      </div>
    </div>
  );
}
