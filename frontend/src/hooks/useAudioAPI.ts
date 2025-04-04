import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

// Define types for API responses
type TTSResponse = components["schemas"]["models.TextToSpeechResponse"];
type SpeechToTextResponse = components["schemas"]["models.SpeechToTextResponse"];
type ErrorResponse = components["schemas"]["models.ErrorResponse"];

export function useAudioAPI() {
    const { client, isAuthenticated, requireAuth, requireAuthWithErrors } = useAuthenticatedAPI();

    const pingAudio = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/audio');
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const translate = useCallback(async (content: components["schemas"]["models.TranslateRequest"]) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/audio/translate', {
                body: content
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const tts = useCallback(async (content: components["schemas"]["models.TextToSpeechRequest"]) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/audio/tts', {
                body: content
            });
            return { 
                data: data as TTSResponse, 
                error: error as ErrorResponse | null 
            };
        })
    }, [client, requireAuth]);

    const stt = useCallback(async (content: components["schemas"]["models.SpeechToTextRequest"]) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/audio/stt', {
                body: content
            });
            return { 
                data: data as SpeechToTextResponse, 
                error: error as ErrorResponse | null 
            };
        })
    }, [client, requireAuthWithErrors]);

    return { isAuthenticated, pingAudio, translate, tts, stt };
}