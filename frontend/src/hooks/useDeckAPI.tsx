import { useCallback } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export function useDeckAPI() {
    const { client, isAuthenticated, requireAuth } = useAuthenticatedAPI();

    const getDecks = useCallback(async () => {
        try {
            return await requireAuth(async () => {
                const { data, error } = await client!.GET('/deck' as any, {});
                if (error) {
                    console.error("API error fetching decks:", error);
                    throw error;
                }
                return data || [];
            });
        } catch (error) {
            console.error('Error fetching decks:', error);
            return [];
        }
    }, [client, requireAuth]);
    
    const createDeck = useCallback(async (deckData: { name: string; description?: string }) => {
        try {
            return await requireAuth(async () => {
                const { data, error } = await client!.POST('/deck/create' as any, {
                    body: deckData
                });
                if (error) {
                    console.error("API error creating deck:", error);
                    throw error;
                }
                return data;
            });
        } catch (error) {
            console.error('Error creating deck:', error);
            throw error; // Re-throw to handle in the component
        }
    }, [client, requireAuth]);

    return { isAuthenticated, getDecks, createDeck };
}