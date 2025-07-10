import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import type { components } from '@/lib/clients/types';

export type LanguageCode = components["schemas"]["whisker_types.LanguageCode"];
export type CEFRLevel = components["schemas"]["whisker_types.CEFRLevel"];

export type GetContentBodyResponse = components["schemas"]["workspaces.GetContentBodyResponse"];
export type CreateContentRequest = components["schemas"]["workspaces.CreateContentRequest"];
export type CreateContentResponse = components["schemas"]["workspaces.CreateContentResponse"];
export type GetIncompleteJobsResponse = components["schemas"]["workspaces.GetIncompleteJobsResponse"];

export type ContentJob = components["schemas"]["whisker_types.ContentJob"];

export function useContentAPI() {
  const { client, isAuthenticated, requireAuthWithErrors } = useAuthenticatedAPI();

  const getContentBody = useCallback(async (workspaceId: string, databaseId: string, contentId: string) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.GET('/workspaces/{workspace_id}/databases/{database_id}/content/{content_id}', { 
        params: { path: { workspace_id: workspaceId, database_id: databaseId, content_id: contentId } }
      });
      return { data: data as GetContentBodyResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])


  const createContent = useCallback(async (workspaceId: string, databaseId: string, body: CreateContentRequest) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.POST('/workspaces/{workspace_id}/databases/{database_id}/content/create', { 
        params: { path: { workspace_id: workspaceId, database_id: databaseId } },
        body: body
      });
      return { data: data as CreateContentResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  const getIncompleteJobs = useCallback(async (workspaceId: string, databaseId: string) => {
    return requireAuthWithErrors(async () => {
      const { data, error } = await client!.GET('/workspaces/{workspace_id}/databases/{database_id}/content/jobs', { 
        params: { path: { workspace_id: workspaceId, database_id: databaseId } }
      });
      return { data: data as GetIncompleteJobsResponse, error: error as components["schemas"]["models.ErrorResponse"] | null };
    })
  }, [client, requireAuthWithErrors])

  return { isAuthenticated, getContentBody, createContent, getIncompleteJobs }
}