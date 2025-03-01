import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useTeacherAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();
    
    const verifyTeacher = useCallback(async () => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/teacher', {})
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth])

    const getClassroomInfo = useCallback(async () => {
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

    return {
        isAuthenticated,
        verifyTeacher,
        getClassroomInfo,
        fetchContent,
        acceptContent,
        rejectContent
    };
}