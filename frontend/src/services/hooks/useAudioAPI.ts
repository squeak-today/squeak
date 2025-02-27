import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../../lib/clients/apiClient';
import { useAuth } from '../../context/AuthContext';

export function useAudioAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const translate = useCallback(async (content: string, source: string, target = 'en') => {
        const { data, error } = await client.POST('/audio/translate', {
            body: {
                sentence: content,
                source,
                target
            }
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    const tts = useCallback(async (language_code: string, text: string, voice_name: string) => {
        const { data, error } = await client.POST('/audio/tts', {
            body: {
                language_code,
                text,
                voice_name
            }
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    return { translate, tts };
}