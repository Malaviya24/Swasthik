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
        className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
        data-testid="button-start-recording"
        title="Record voice message"
      >
        <i className="fas fa-microphone text-gray-500 hover:text-blue-600"></i>
      </button>
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
            className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors"
            data-testid="button-stop-recording"
          >
            Send
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
        <span className="text-xs text-red-600">Speak clearly for better transcription</span>
      </div>
    </div>
  );
}
