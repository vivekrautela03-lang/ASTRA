import { useState, useCallback, useRef } from 'react';
import { speechToTextService } from '../services/speech/stt';
import { textToSpeechService } from '../services/speech/tts';

export function useVoice(onFinalTranscript?: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const stopListening = useCallback(() => {
    speechToTextService.stopListening();
    setIsRecording(false);
    setAudioLevel(0);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      setIsRecording(true);

      // Web Audio Analyser
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Amplitude sampling loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        setAudioLevel(avg);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();

      speechToTextService.startListening((transcript, isFinal) => {
        if (isFinal && transcript.trim() && onFinalTranscript) {
          stopListening();
          onFinalTranscript(transcript.trim());
        }
      });

      return true;
    } catch (err) {
      console.warn('[VOICE HOOK]: Microphone permission denied or unavailable:', err);
      setHasPermission(false);
      setIsRecording(false);
      return false;
    }
  }, [onFinalTranscript, stopListening]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    return textToSpeechService.speak(text, onEnd);
  }, []);

  const stopSpeaking = useCallback(() => {
    textToSpeechService.stop();
  }, []);

  return {
    isRecording,
    hasPermission,
    audioLevel,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}

export default useVoice;
