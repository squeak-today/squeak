import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useNewsAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();
    
    const getNews = useCallback(async (params: {
        id: string;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/news', {
                params: {
                    query: { ...params }
            }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const queryNews = useCallback(async (params: {
        language: string;
        cefr: string;
        subject: string;
        page: string;
        pagesize: string;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/news/query', {
                params: {
                    query: { ...params }
            }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    return { isAuthenticated, getNews, queryNews };
}