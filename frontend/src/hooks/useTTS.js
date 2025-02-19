import { useState, useCallback } from 'react';
import { ttsService } from '../services/ttsService';
import { useNotification } from '../context/NotificationContext';

export const useTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const speak = useCallback(async (text, languageCode, voiceName) => {
    setIsLoading(true);
    try {
      const audioContent = await ttsService.textToSpeech(text, languageCode, voiceName);
      
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      await audio.play();
      
      return audio;
    } catch (error) {
      showNotification('Failed to convert text to speech. Please try again.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  return {
    speak,
    isLoading
  };
}; 