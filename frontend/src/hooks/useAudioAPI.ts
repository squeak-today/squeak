import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useAudioAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

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
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/audio/tts', {
                body: content
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    return { pingAudio, translate, tts };
}