import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';

export type SoftDeleteStatus = components["schemas"]["workspaces.SoftDeleteStatus"];
export type Workspace = components["schemas"]["workspaces.Workspace"];
export type Database = components["schemas"]["workspaces.Database"];
export type WorkspacesSummary = components["schemas"]["workspaces.WorkspacesSummary"];
export type DeletedSummary = components["schemas"]["workspaces.DeletedSummary"];

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

  const getDeletedSummary = useCallback(async () => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.GET('/workspaces/deleted');
      return { data: data as DeletedSummary, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  const createWorkspace = useCallback(async (body: components["schemas"]["workspaces.CreateWorkspaceRequest"]) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.POST('/workspaces/create', { 
        body: body
      });
      return { data: data as components["schemas"]["workspaces.CreateWorkspaceResponse"], error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  const deleteWorkspace = useCallback(async (workspaceId: string, status: SoftDeleteStatus) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.DELETE('/workspaces/{workspace_id}', { 
        params: { path: { workspace_id: workspaceId }, query: { status: status } }
      });
      return { data: data as components["schemas"]["workspaces.DeleteWorkspaceResponse"], error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  return { isAuthenticated, getWorkspacesSummary, getDeletedSummary, createWorkspace, deleteWorkspace }
}