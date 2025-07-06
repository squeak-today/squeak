import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';

export type CreateDatabaseRequest = components["schemas"]["workspaces.CreateDatabaseRequest"];
export type CreateDatabaseResponse = components["schemas"]["workspaces.CreateDatabaseResponse"];

export function useDatabasesAPI() {
    const { client, isAuthenticated, requireAuthWithErrors } = useAuthenticatedAPI();

    const createDatabase = useCallback(async (workspaceId: string, body: CreateDatabaseRequest) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/workspaces/{workspace_id}/databases/create', { 
                params: { path: { workspace_id: workspaceId } },
                body: body
            });
            return { data: data as CreateDatabaseResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
        })
    }, [client, requireAuthWithErrors])

    return { isAuthenticated, createDatabase }
}