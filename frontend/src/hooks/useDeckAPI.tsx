import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export function useDeckAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getDecks = useCallback(async (userID: string) => {
        try {
            return await requireAuth(async () => {
                const { data, error } = await client!.GET('/deck' as any, {
                    params: {
                        query: { user_id: userID }
                    }
                });
                if (error) throw error;
                return data || [];
            });
        } catch (error) {
            console.error('Error fetching decks:', error);
            return [];
        }
    }, [client, requireAuth]);

    const createDeck = useCallback(async (deckData: { name: string; description?: string }) => {
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