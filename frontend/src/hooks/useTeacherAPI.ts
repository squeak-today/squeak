import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';

export function useTeacherAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);
    
    const verifyTeacher = useCallback(async () => {
        const { data, error } = await client.GET('/teacher', {})
        if (error) { throw error; }
        return data;
    }, [client])

    const getClassroomInfo = useCallback(async () => {
        const { data, error } = await client.GET('/teacher/classroom', {})
        if (error) { throw error; }
        return data;
    }, [client])

    const fetchContent = useCallback(async (params: {
        language: string;
        cefr: string;
        subject: string;
        page: string;
        pagesize: string;
        whitelist: string;
    }) => {
        const { data, error } = await client.GET('/teacher/classroom/content', {
            params: {
                query: { ...params, content_type: 'All' }
            }
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    const acceptContent = useCallback(async (content: {
        content_type: string;
        content_id: number;
    }) => {
        const { data, error } = await client.POST('/teacher/classroom/accept', { body: content })
        if (error) { throw error; }
        return data;
    }, [client])

    const rejectContent = useCallback(async (content: {
        content_type: string;
        content_id: number;
    }) => {
        const { data, error } = await client.POST('/teacher/classroom/reject', { body: content })
        if (error) { throw error; }
        return data;
    }, [client])

    return {
        verifyTeacher,
        getClassroomInfo,
        fetchContent,
        acceptContent,
        rejectContent
    };
}