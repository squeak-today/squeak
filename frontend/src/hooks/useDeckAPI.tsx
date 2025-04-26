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

    const getDeck = useCallback(async (deckId: number) => {
        return requireAuth(async () => {
            try {
                const { data, error } = await client!.GET(`/deck/${deckId}` as any, {});
                if (error) {
                    console.error("Error fetching deck:", error);
                    throw error;
                }
                
                // If we got data but no flashcards, ensure it has an empty array
                if (data && !data.flashcards) {
                    data.flashcards = [];
                }
                
                return data;
            } catch (error) {
                console.error(`Error fetching deck with ID ${deckId}:`, error);
                throw error;
            }
        });
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


    const deleteDeck = useCallback(async (deckId: number) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST(`/deck/${deckId}/delete` as any, {});
            if (error) throw error;
            return data;
        });
    }, [client, requireAuth]);

    const createFlashcard = useCallback(async (data: { deck_id: number; front_content: string; back_content: string; source_url?: string }) => {
        return requireAuth(async () => {
            const { data: response, error } = await client!.POST('/flashcard/create' as any, { body: data });
            if (error) throw error;
            return response;
        });
    }, [client, requireAuth]);
    
    const updateFlashcard = useCallback(async (flashcardId: number, data: { front_content: string; back_content: string; source_url?: string }) => {
        return requireAuth(async () => {
            const { data: response, error } = await client!.POST(`/flashcard/${flashcardId}/update` as any, { body: data });
            if (error) throw error;
            return response;
        });
    }, [client, requireAuth]);
    
    const deleteFlashcard = useCallback(async (flashcardId: number) => {
        return requireAuth(async () => {
            const { data, error } = await client!.POST(`/flashcard/${flashcardId}/delete` as any, {});
            if (error) throw error;
            return data;
        });
    }, [client, requireAuth]);

    return { isAuthenticated, getDecks, createDeck, deleteDeck, createFlashcard, deleteFlashcard, updateFlashcard, getDeck };
}