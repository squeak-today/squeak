import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';

export function useNewsAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const getNews = useCallback(async (params: {
        id: string;
    }) => {
        const { data, error } = await client.GET('/news', {
            params: {
                query: { ...params }
            }
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    const queryNews = useCallback(async (params: {
        language: string;
        cefr: string;
        subject: string;
        page: string;
        pagesize: string;
    }) => {
        const { data, error } = await client.GET('/news/query', {
            params: {
                query: { ...params }
            }
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    return { getNews, queryNews };
}