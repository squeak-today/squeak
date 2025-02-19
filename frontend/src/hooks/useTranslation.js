import { useState } from 'react';
import { translationService } from '../services/translationService';
import { useNotification } from '../context/NotificationContext';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { showNotification } = useNotification();

  const translate = async (content, source, target = 'en') => {
    setIsTranslating(true);
    try {
      const translation = await translationService.translate(content, source, target);
      return translation;
    } catch (error) {
      showNotification('Failed to get translation. Please try again.', 'error');
      return content;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    isTranslating
  };
}; 