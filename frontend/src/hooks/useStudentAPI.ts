import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useStudentAPI() {
  const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

  const getStudentStatus = useCallback(async () => {
    return requireAuth(async () => {
      const { data, error } = await client!.GET('/student', {});
      if (error) throw error;
      return data;
    });
  }, [client, requireAuth]);

  const getClassroomInfo = useCallback(async () => {
    return requireAuth(async () => {
      const { data, error } = await client!.GET('/student/classroom', {});
      if (error) throw error;
      return data;
    });
  }, [client, requireAuth]);

  const joinClassroom = useCallback(
    async (content: components['schemas']['models.JoinClassroomRequest']) => {
      return requireAuth(async () => {
        const { data, error } = await client!.POST('/student/classroom/join', {
          body: content,
        });
        if (error) throw error;
        return data;
      });
    },
    [client, requireAuth]
  );

  // New function to fetch student performance
  const getPerformance = useCallback(async () => {
    return requireAuth(async () => {
      const { data, error } = await client!.GET('/student/performance' as any, {});
      if (error) throw error;
      return data as { incorrectPercentage: number }; // Adjust type based on actual response
    });
  }, [client, requireAuth]);

  return {
    getStudentStatus,
    getClassroomInfo,
    joinClassroom,
    isAuthenticated,
    getPerformance, // Added to the return object
  };
}