import { useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';
import { components } from '../lib/clients/types';

type ErrorResponse = components["schemas"]["models.ErrorResponse"];
type APIResponse<T> = { data: T | null, error: ErrorResponse | null };

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

    const requireAuthWithErrors = <T>(
        operation: () => Promise<APIResponse<T>> | APIResponse<T>
    ): Promise<APIResponse<T>> => {
        if (!client) {
            return Promise.resolve({
                data: null,
                error: {
                    error: 'Missing authentication',
                    code: 'AUTH_REQUIRED'
                }
            });
        }
        
        return Promise.resolve(operation());
    };

    return {
        client,
        isAuthenticated,
        requireAuth,
        requireAuthWithErrors
    };
}
