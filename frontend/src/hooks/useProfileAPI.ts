import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';
import { components } from '../lib/clients/types';

export function useProfileAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const getProfile = useCallback(async () => {
        const { data, error } = await client.GET('/profile', {});
        if (error) { throw error; }
        return data;
    }, [client]);

    const upsertProfile = useCallback(async (content: components["schemas"]["models.UpsertProfileRequest"]) => {
        const { data, error } = await client.POST('/profile/upsert', {
            body: content
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    return { getProfile, upsertProfile };
    
    
}