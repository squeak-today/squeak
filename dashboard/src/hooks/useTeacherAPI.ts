import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useTeacherAPI() {
    const { client, isAuthenticated, requireAuth, requireAuthWithErrors } = useAuthenticatedAPI();
    
    const verifyTeacher = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/teacher', {})
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth])

    const getClassroomList = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/teacher/classroom', {})
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth])

    const fetchContent = useCallback(async (params: {
        language: string;
        cefr: string;
        subject: string;
        page: string;
        pagesize: string;
        whitelist: string;
        classroom_id: string;
    }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/teacher/classroom/content', {
                params: {
                    query: { ...params, content_type: 'All' }
                }
            });
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const acceptContent = useCallback(async (content: components['schemas']['models.AcceptContentRequest']) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/teacher/classroom/accept', { body: content })
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth])

    const rejectContent = useCallback(async (content: components['schemas']['models.RejectContentRequest']) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/teacher/classroom/reject', { body: content })
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth])

    const updateClassroom = useCallback(async (content: components['schemas']['models.UpdateClassroomRequest']) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/teacher/classroom/update', { body: content })
            return {
                data: data as components["schemas"]["models.UpdateClassroomResponse"],
                error: error as components["schemas"]["models.ErrorResponse"] | null
            };
        })
    }, [client, requireAuthWithErrors])

    const createClassroom = useCallback(async (content: components['schemas']['models.CreateClassroomRequest']) => {
        return requireAuthWithErrors(async () => {
            const { data, error } = await client!.POST('/teacher/classroom/create', { body: content })
            return {
                data: data as components["schemas"]["models.CreateClassroomResponse"],
                error: error as components["schemas"]["models.ErrorResponse"] | null
            };
        })
    }, [client, requireAuthWithErrors])

    return {
        isAuthenticated,
        verifyTeacher,
        getClassroomList,
        fetchContent,
        acceptContent,
        rejectContent,
        updateClassroom,
        createClassroom
    };
}