import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export function useDeckAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getDecks = useCallback(async (userID: string) => {
        return requireAuth(async () => {
            const { data, error } = await client!.GET('/deck' as any, {
                params: {
                    query: { user_id: userID }
                }
            });
            if (error) throw error;
            return data;
        });
    }, [client, requireAuth]);

    const createDeck = useCallback(async (deckData: { title: string; language: string; is_public: boolean }) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST('/deck/create' as any, {
                body: deckData
            });
            if (error) throw error;
            return data;
        });
    }, [client, requireAuth]);

    return { isAuthenticated, getDecks, createDeck };
}