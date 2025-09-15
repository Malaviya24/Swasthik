import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/lib/gemini';

export function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Try to find the best supported audio format
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      console.log('Using MIME type for recording:', mimeType);
      
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder.current || !isRecording) {
        reject(new Error('Recording not started'));
        return;
      }

      mediaRecorder.current.onstop = async () => {
        try {
          // Try different audio formats for better compatibility
          let audioBlob: Blob;
          const mimeType = mediaRecorder.current?.mimeType || 'audio/webm';
          
          // Use the actual MIME type from the MediaRecorder
          if (mimeType.includes('webm')) {
            audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
          } else if (mimeType.includes('mp4')) {
            audioBlob = new Blob(chunks.current, { type: 'audio/mp4' });
          } else if (mimeType.includes('ogg')) {
            audioBlob = new Blob(chunks.current, { type: 'audio/ogg' });
          } else {
            audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
          }
          
          console.log('Audio blob created:', {
            size: audioBlob.size,
            type: audioBlob.type,
            mimeType: mimeType
          });
          
          const transcript = await transcribeAudio(audioBlob);
          
          // Stop timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          setIsRecording(false);
          setRecordingTime(0);
          
          // Stop all tracks
          const tracks = mediaRecorder.current?.stream?.getTracks();
          tracks?.forEach(track => track.stop());
          
          resolve(transcript);
        } catch (error) {
          reject(error);
        }
      };

      mediaRecorder.current.stop();
    });
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setRecordingTime(0);
      
      // Stop all tracks
      const tracks = mediaRecorder.current?.stream?.getTracks();
      tracks?.forEach(track => track.stop());
    }
  }, [isRecording]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    recordingTime: formatTime(recordingTime),
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
