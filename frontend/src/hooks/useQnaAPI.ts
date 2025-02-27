import { useCallback, useMemo } from 'react';
import { getAPIClient } from '../lib/clients/apiClient';
import { useAuth } from '../context/AuthContext';
import { components } from '../lib/clients/types';

export function useQnaAPI() {
    const { jwtToken } = useAuth();
    if (!jwtToken) { throw new Error('No valid session found'); }
    const client = useMemo(() => getAPIClient(jwtToken), [jwtToken]);

    const getQuestion = useCallback(async (content: components['schemas']['models.GetQuestionRequest']) => {
        const { data, error } = await client.POST('/qna', { body: content })
        if (error) { throw error; }
        return data;
    }, [client]);

    const evaluateQnA = useCallback(async (content: components['schemas']['models.EvaluateAnswerRequest']) => {
        const { data, error } = await client.POST('/qna/evaluate', { body: content })
        if (error) { throw error; }
        return data;
    }, [client]);


    return { getQuestion, evaluateQnA };
    
}