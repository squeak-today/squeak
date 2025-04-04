import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useBillingAPI() {
    const { client, requireAuthWithErrors } = useAuthenticatedAPI();

    const getBillingAccount = useCallback(async () => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.GET('/billing');
            return {
                data: data as components["schemas"]["models.BillingAccountResponse"] | null,
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);

    const getBillingAccountUsage = useCallback(async (params: {
        plan: string;
    }) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.GET('/billing/usage', {
                params: {
                    query: { ...params }
            }
            });
            return {
                data: data as components["schemas"]["models.BillingAccountUsageResponse"] | null,
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);

    const createCheckoutSession = useCallback(async (content: components["schemas"]["models.CreateIndividualCheckoutSessionRequest"]) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/billing/create-checkout-session', {
                body: content
            });
            return {
                data: data as components["schemas"]["models.CreateIndividualCheckoutSessionResponse"] | null,
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);

    const cancelSubscriptionAtEndOfPeriod = useCallback(async (content: components["schemas"]["models.CancelIndividualSubscriptionRequest"]) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/billing/cancel-subscription-eop', {
                body: content
            });
            return {
                data: data as components["schemas"]["models.CancelIndividualSubscriptionResponse"] | null,
                error: error as components["schemas"]["models.ErrorResponse"] | null
            }
        });
    }, [client, requireAuthWithErrors]);

    return { 
        getBillingAccount,
        getBillingAccountUsage,
        createCheckoutSession,
        cancelSubscriptionAtEndOfPeriod
    };
}