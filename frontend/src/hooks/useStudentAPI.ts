import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';
import { components } from '../lib/clients/types';

export function useStudentAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const getStudentStatus = useCallback(async () => {
        const { data, error } = await client.GET('/student', {});
        if (error) { throw error; }
        return data;
    }, [client]);

    const getClassroomInfo = useCallback(async () => {
        const { data, error } = await client.GET('/student/classroom', {});
        if (error) { throw error; }
        return data;
    }, [client]);
    
    const joinClassroom = useCallback(async (content: components["schemas"]["models.JoinClassroomRequest"]) => {
        const { data, error } = await client.POST('/student/classroom/join', {
            body: content
        });
        if (error) { throw error; }
        return data;
    }, [client]);

    return { getStudentStatus, getClassroomInfo, joinClassroom };
    
}