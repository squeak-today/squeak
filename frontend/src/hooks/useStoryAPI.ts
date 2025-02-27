import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';

export function useStoryAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const getStory = useCallback(async (params: {
        id: string;
        page: string;
    }) => {
        const { data, error } = await client.GET('/story', {
            params: { query: { ...params } }
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    const getStoryQnAContext = useCallback(async (params: {
        id: string;
    }) => {
        const { data, error } = await client.GET('/story/context', {
            params: { query: { ...params } }
        });
        if (error) { throw error; }
        return data;
    }, [client]);
    
    return { getStory, getStoryQnAContext };
}