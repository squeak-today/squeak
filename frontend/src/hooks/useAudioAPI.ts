import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';
import { components } from '../lib/clients/types';

export function useAudioAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const pingAudio = useCallback(async () => {
        const { data, error } = await client.GET('/audio');
        if (error) { throw error; }
        return data;
    }, [client]);

    const translate = useCallback(async (content: components["schemas"]["models.TranslateRequest"]) => {
        const { data, error } = await client.POST('/audio/translate', {
            body: content
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    const tts = useCallback(async (content: components["schemas"]["models.TextToSpeechRequest"]) => {
        const { data, error } = await client.POST('/audio/tts', {
            body: content
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    return { pingAudio, translate, tts };
}