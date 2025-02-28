import { useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';

export function useAuthenticatedAPI() {
    const { jwtToken } = useAuth();
    const client = useMemo(() => 
        jwtToken ? getAPIClient(jwtToken) : null,
    [jwtToken]);

    const isAuthenticated = Boolean(client);

    const requireAuth = <T>(operation: () => T): T => {
        if (!client) {
            throw new Error('Missing authentication');
        }
        return operation();
    };

    return {
        client,
        isAuthenticated,
        requireAuth
    };
}
