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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        chunks.current.push(event.data);
      };

      mediaRecorder.current.start();
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
          const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
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
