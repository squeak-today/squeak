import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';

export function useProgressAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const getProgress = useCallback(async () => {
        const { data, error } = await client.GET('/progress', {});
        if (error) { throw error; }
        return data;
    }, [client]);

    const incrementProgress = useCallback(async (params: {
        amount: number;
    }) => {
        const { data, error } = await client.GET('/progress/increment', {
            params: {
                query: { ...params }
            }
        });
        if (error) { throw error; }
        return data;
    }, [client]);
    
    const getStreak = useCallback(async () => {
        const { data, error } = await client.GET('/progress/streak', {});
        if (error) { throw error; }
        return data;
    }, [client]);

    return { getProgress, incrementProgress, getStreak };
    
}