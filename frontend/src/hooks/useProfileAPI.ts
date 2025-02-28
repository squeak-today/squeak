import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useProfileAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getProfile = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/profile', {});
            if (error) throw error;
            return data;
        });
    }, [client, requireAuth]);

    const upsertProfile = useCallback(async (content: components["schemas"]["models.UpsertProfileRequest"]) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/profile/upsert', {
                body: content
            });
            if (error) throw error;
            return data;
        });
    }, [client, requireAuth]);

    return { 
        getProfile, 
        upsertProfile,
        isAuthenticated 
    };
}