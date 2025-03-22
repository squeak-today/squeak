import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useOrganizationAPI() {
    const { client, isAuthenticated, requireAuthWithErrors } = useAuthenticatedAPI();

    const getOrganization = useCallback(async () => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.GET('/organization');
            return { 
                data: data as components["schemas"]["models.OrganizationResponse"], 
                error: error as components["schemas"]["models.ErrorResponse"] | null 
            };
        })
    }, [client, requireAuthWithErrors])

    const createOrganization = useCallback(async () => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/organization/create', {
                body: {}
            });
            return {
                data: data as components["schemas"]["models.CreateOrganizationResponse"],
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);

    const joinOrganization = useCallback(async (content: components["schemas"]["models.JoinOrganizationRequest"]) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/organization/join', {
                body: content
            });
            return {
                data: data as components["schemas"]["models.JoinOrganizationResponse"],
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);
    
    return {
        isAuthenticated,
        getOrganization,
        createOrganization,
        joinOrganization
    }
}