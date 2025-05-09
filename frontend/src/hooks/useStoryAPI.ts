import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

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
    
    const queryStories = useCallback(async (params: {
        language: string;
        cefr: string;
        subject: string;
        page: string;
        pagesize: string;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/story/query', {
                params: { query: { ...params } }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);
    
    return { isAuthenticated, getStory, getStoryQnAContext, queryStories };
}