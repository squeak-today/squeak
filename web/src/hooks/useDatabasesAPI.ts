import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';
import type { DatabaseType } from './useWorkspacesAPI';

export type CreateDatabaseRequest = components["schemas"]["workspaces.CreateDatabaseRequest"];
export type CreateDatabaseResponse = components["schemas"]["workspaces.CreateDatabaseResponse"];

export type Content = components["schemas"]["workspaces.Content"];

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

  const queryDatabase = useCallback(async (workspaceId: string, databaseId: string, type: DatabaseType) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.POST('/workspaces/{workspace_id}/databases/{database_id}/query', { 
        params: { path: { workspace_id: workspaceId, database_id: databaseId } },
        body: { type: type }
      });
      return { 
        data: data as components["schemas"]["workspaces.QueryDatabaseResponse"],
        error: error as components["schemas"]["models.ErrorResponse"] | null 
      };
    })
  }, [client, requireAuthWithErrors])

  return { isAuthenticated, createDatabase, queryDatabase }
}