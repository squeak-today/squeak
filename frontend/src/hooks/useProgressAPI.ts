import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useProgressAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getProgress = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/progress', {});
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const incrementProgress = useCallback(async (params: {
        amount: number;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/progress/increment', {
                params: {
                    query: { ...params }
            }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);
    
    const getStreak = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/progress/streak', {});
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    return { isAuthenticated, getProgress, incrementProgress, getStreak };
    
}