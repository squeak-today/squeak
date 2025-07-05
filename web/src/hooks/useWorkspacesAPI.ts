import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';

export type WorkspacesSummary = components["schemas"]["workspaces.WorkspacesSummary"];

export function useWorkspacesAPI() {
    const { client, isAuthenticated, requireAuthWithErrors } = useAuthenticatedAPI();

    const getWorkspacesSummary = useCallback(async () => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.GET('/workspaces/summary');
            return { 
                data: data as WorkspacesSummary, 
                error: error as components["schemas"]["models.ErrorResponse"] | null 
            };
        })
    }, [client, requireAuthWithErrors])

    return { isAuthenticated, getWorkspacesSummary }
}