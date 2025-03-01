import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';
import { components } from '../lib/clients/types';

export function useQnaAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getQuestion = useCallback(async (content: components['schemas']['models.GetQuestionRequest']) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/qna', { body: content })
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);

    const evaluateQnA = useCallback(async (content: components['schemas']['models.EvaluateAnswerRequest']) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/qna/evaluate', { body: content })
            if (error) { throw error; }
            return data;
        })
    }, [client, requireAuth]);


    return { isAuthenticated, getQuestion, evaluateQnA };
    
}