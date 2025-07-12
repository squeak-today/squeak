import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';

export type TranslateRequest = components["schemas"]["models.TranslateRequest"];
export type TranslateResponse = components["schemas"]["models.TranslateResponse"];
export type TextToSpeechRequest = components["schemas"]["models.TextToSpeechRequest"];
export type TextToSpeechResponse = components["schemas"]["models.TextToSpeechResponse"];
export type SpeechToTextRequest = components["schemas"]["models.SpeechToTextRequest"];
export type SpeechToTextResponse = components["schemas"]["models.SpeechToTextResponse"];

export function useLanguageAPI() {
  const { client, isAuthenticated, requireAuthWithErrors } = useAuthenticatedAPI();

  const translate = useCallback(async (body: TranslateRequest) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.POST('/language/translate', { 
        body: body
      });
      return { data: data as TranslateResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  const textToSpeech = useCallback(async (body: TextToSpeechRequest) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.POST('/language/tts', { 
        body: body
      });
      return { data: data as TextToSpeechResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  const speechToText = useCallback(async (body: SpeechToTextRequest) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.POST('/language/stt', { 
        body: body
      });
      return { data: data as SpeechToTextResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  return { isAuthenticated, translate, textToSpeech, speechToText }
}