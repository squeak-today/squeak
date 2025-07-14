import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';
import type { SoftDeleteStatus } from './useWorkspacesAPI';

export type CreateDatabaseRequest = components["schemas"]["workspaces.CreateDatabaseRequest"];
export type CreateDatabaseResponse = components["schemas"]["workspaces.CreateDatabaseResponse"];
export type DeleteDatabaseResponse = components["schemas"]["workspaces.DeleteDatabaseResponse"];

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

  const deleteDatabase = useCallback(async (workspaceId: string, databaseId: string, status: SoftDeleteStatus) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.DELETE('/workspaces/{workspace_id}/databases/{database_id}', { 
        params: { path: { workspace_id: workspaceId, database_id: databaseId }, query: { status: status } }
      });
      return { data: data as DeleteDatabaseResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  const queryDatabase = useCallback(async (workspaceId: string, databaseId: string) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.GET('/workspaces/{workspace_id}/databases/{database_id}/query', { 
        params: { path: { workspace_id: workspaceId, database_id: databaseId } }
      });
      return { 
        data: data as components["schemas"]["workspaces.QueryDatabaseResponse"],
        error: error as components["schemas"]["models.ErrorResponse"] | null 
      };
    })
  }, [client, requireAuthWithErrors])

  return { isAuthenticated, createDatabase, deleteDatabase, queryDatabase }
}