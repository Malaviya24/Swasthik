import { useSpeech } from '@/hooks/use-speech';
import { motion } from "framer-motion";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useSpeech();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const transcript = await stopRecording();
      onTranscript(transcript);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };

  if (!isRecording) {
    return (
      <button 
        onClick={handleStartRecording}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        data-testid="button-start-recording"
      >
        <i className="fas fa-microphone text-muted-foreground"></i>
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-accent/10 border border-accent/30 rounded-lg" data-testid="voice-recording-ui">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-3 h-3 bg-accent rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-sm text-accent font-medium">Recording... {recordingTime}</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleCancelRecording}
            className="text-sm text-muted-foreground hover:text-foreground"
            data-testid="button-cancel-recording"
          >
            Cancel
          </button>
          <button 
            onClick={handleStopRecording}
            className="text-sm text-accent hover:text-accent/80"
            data-testid="button-stop-recording"
          >
            Send
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center space-x-1">
        {/* Audio Waveform Visualization */}
        <div className="flex items-end space-x-px">
          {[2, 4, 3, 5, 2, 4, 3].map((height, index) => (
            <motion.div
              key={index}
              className="w-1 bg-accent/60 rounded"
              style={{ height: `${height * 4}px` }}
              animate={{ height: [`${height * 4}px`, `${height * 6}px`, `${height * 4}px`] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: index * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
