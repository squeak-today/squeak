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

    const createCheckoutSession = useCallback(async () => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/organization/payments/create-checkout-session', {
                body: {}
            });
            return {
                // i had to add this as unknown to avoid the type error
                // openapi-typescript seems to hate shit ass 303 redirects so if they ever
                // fix it, fix this.
                data: data as components["schemas"]["models.CreateCheckoutSessionResponse"],
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);

    const cancelSubscriptionAtEndOfPeriod = useCallback(async () => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/organization/payments/cancel-subscription-eop', {
                body: {}
            });
            return {
                data: data as components["schemas"]["models.CancelSubscriptionResponse"],
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);
    
    return {
        isAuthenticated,
        getOrganization,
        createOrganization,
        joinOrganization,
        createCheckoutSession,
        cancelSubscriptionAtEndOfPeriod
    }
}