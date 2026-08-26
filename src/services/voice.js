import { speechToTextService } from './speech/stt';
import { textToSpeechService } from './speech/tts';

export const voiceService = {
  startListening: (onTranscript) => {
    return speechToTextService.startListening(onTranscript);
  },
  stopListening: () => {
    speechToTextService.stopListening();
  },
  speak: (text, onEnd) => {
    return textToSpeechService.speak(text, onEnd);
  },
  stopSpeaking: () => {
    textToSpeechService.stop();
  },
  isSpeaking: () => {
    return textToSpeechService.isSpeaking();
  }
};

export default voiceService;
