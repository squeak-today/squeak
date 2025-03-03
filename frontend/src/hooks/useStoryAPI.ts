import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useStoryAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getStory = useCallback(async (params: {
        id: string;
        page: string;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/story', {
                params: { query: { ...params } }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const getStoryQnAContext = useCallback(async (params: {
        id: string;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/story/context', {
                params: { query: { ...params } }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);
    
    return { isAuthenticated, getStory, getStoryQnAContext };
}