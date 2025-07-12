import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Volume2 } from 'lucide-react';
import { useLanguageAPI } from '@/hooks/useLanguageAPI';
import { TTS_LANGUAGE_CODES, TTS_VOICE_IDS } from '@/lib/lang_codes';
import { TRANSLATABLE_SELECTOR } from '@/lib/utils';

interface Translation {
  sourceWord: string;
  sourceSentence: string;
  translatedWord?: string;
  translatedSentence?: string;
  
  sourceLanguage?: string;
  targetLanguage: string;
  isLoading: boolean;
  isSentenceLoading: boolean;
}

interface TranslationContextType {
  showTranslation: (sourceWord: string, sourceSentence: string, targetLanguage: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function TranslationPopup({ translation, onClose, isUpdating }: { 
  translation: Translation; 
  onClose: () => void;
  isUpdating: boolean;
}) {
  const { textToSpeech } = useLanguageAPI();
  const popupRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isUpdating) return;
      const target = event.target as HTMLElement;
      if (target.closest(TRANSLATABLE_SELECTOR)) return;
      
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isUpdating]);
  
  const handlePlayAudio = async (text: string, languageCode: string) => {
    try {
      const ttsLanguageCode = TTS_LANGUAGE_CODES[languageCode as keyof typeof TTS_LANGUAGE_CODES];
      const voiceId = TTS_VOICE_IDS[ttsLanguageCode as keyof typeof TTS_VOICE_IDS];
      
      if (!ttsLanguageCode || !voiceId) {
        console.error('Unsupported language code:', languageCode);
        return;
      }
      
      const response = await textToSpeech({
        text,
        language_code: ttsLanguageCode,
        voice_name: voiceId,
        natural: false
      });
      
      if (response.data?.audio_content) {
        const audio = new Audio(`data:audio/mp3;base64,${response.data.audio_content}`);
        audio.play();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  console.log(translation);
  
  return (
    <Card 
      ref={popupRef}
      className="relative w-96 border-1 border-primary/20 animate-fadeIn"
    >
      <CardContent className="px-4 space-y-2">
        <div className="space-y-1">
          {translation.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <h3 className="text-2xl font-bold text-foreground break-words">
                  {translation.translatedWord || 'Translation failed'}
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {translation.targetLanguage.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <p className="text-sm text-muted-foreground">
                  {translation.sourceWord}
                </p>
                {translation.isLoading ? (
                  <Skeleton className="h-4 w-6" />
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">
                    {translation.sourceLanguage?.toUpperCase()}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-primary/10 flex-shrink-0"
                  onClick={() => handlePlayAudio(translation.sourceWord, translation.sourceLanguage!)}
                >
                  <Volume2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t pt-2 space-y-2">
          <div className="space-y-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {translation.isSentenceLoading ? (
                  <Skeleton className="h-4 w-6" />
                ) : (
                  <span className="text-xs text-muted-foreground font-mono uppercase">
                    {translation.sourceLanguage?.toUpperCase()}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary/10 flex-shrink-0"
                  onClick={() => handlePlayAudio(translation.sourceSentence, translation.sourceLanguage!)}
                >
                  <Volume2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
              <p className="text-sm bg-muted/30 rounded p-2 leading-relaxed break-words">
                {translation.sourceSentence}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono uppercase">
                  {translation.targetLanguage.toUpperCase()}
                </span>
                {translation.translatedSentence && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-primary/10 flex-shrink-0"
                    onClick={() => handlePlayAudio(translation.translatedSentence!, translation.targetLanguage)}
                  >
                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
              {translation.isSentenceLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <p className="text-sm bg-primary/5 rounded p-2 leading-relaxed break-words">
                  {translation.translatedSentence || 'Sentence translation failed'}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentTranslation, setCurrentTranslation] = useState<Translation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { translate } = useLanguageAPI();

  const showTranslation = async (sourceWord: string, sourceSentence: string, targetLanguage: string) => {
    setIsUpdating(true);
    
    const newTranslation: Translation = {
      sourceWord,
      sourceSentence,
      targetLanguage,
      isLoading: true,
      isSentenceLoading: true
    };
    
    setCurrentTranslation(newTranslation);
    setTimeout(() => setIsUpdating(false), 300);
    
    try {
      const wordResponse = await translate({
        sentence: sourceWord,
        target: targetLanguage
      });
      
      if (wordResponse.data?.sentence) {
        setCurrentTranslation(prev => prev ? {
          ...prev,
          translatedWord: wordResponse.data!.sentence,
          sourceLanguage: wordResponse.data!.detected_source_language,
          isLoading: false
        } : null);
      } else {
        setCurrentTranslation(prev => prev ? {
          ...prev,
          translatedWord: undefined,
          sourceLanguage: undefined,
          isLoading: false
        } : null);
      }
    } catch (error) {
      console.error('Word translation failed:', error);
      setCurrentTranslation(prev => prev ? {
        ...prev,
        translatedWord: undefined,
        sourceLanguage: undefined,
        isLoading: false
      } : null);
    }
    
    try {
      const sentenceResponse = await translate({
        sentence: sourceSentence,
        target: targetLanguage
      });
      
      if (sentenceResponse.data?.sentence) {
        setCurrentTranslation(prev => prev ? {
          ...prev,
          translatedSentence: sentenceResponse.data!.sentence,
          sourceLanguage: sentenceResponse.data!.detected_source_language,
          isSentenceLoading: false
        } : null);
      } else {
        setCurrentTranslation(prev => prev ? {
          ...prev,
          translatedSentence: undefined,
          sourceLanguage: undefined,
          isSentenceLoading: false
        } : null);
      }
    } catch (error) {
      console.error('Sentence translation failed:', error);
      setCurrentTranslation(prev => prev ? {
        ...prev,
        translatedSentence: undefined,
        sourceLanguage: undefined,
        isSentenceLoading: false
      } : null);
    }
  };

  const handleClose = () => {
    setCurrentTranslation(null);
  };

  return (
    <TranslationContext.Provider value={{ showTranslation }}>
      {children}
      {currentTranslation && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[100] p-4 animate-slideInUp">
          <TranslationPopup 
            translation={currentTranslation}
            onClose={handleClose}
            isUpdating={isUpdating}
          />
        </div>
      )}
    </TranslationContext.Provider>
  );
}

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};