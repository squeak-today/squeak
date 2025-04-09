import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckAPI } from '../hooks/useDeckAPI';
import { useNotification } from '../context/NotificationContext';
import {
    DeckBrowserContainer,
    DeckBrowserTitle,
    ContentLayout,
    LoadingText,
    EmptyStateText,
    DeckGrid,
    DeckCard,
    DeckName,
    DeckDescription,
    DeckStatus,
    DeckActionButtons,
    ViewButton,
    DeleteButton,
    CreateDeckForm,
    FormInput,
    CreateButton,
    FormTitle
} from '../styles/DeckBrowserStyles';

interface Deck {
    id: number;
    name: string;
    description: string;
    is_public: boolean;
    is_system: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface DeckBrowserProps {
    userID: string;
}

const DeckBrowser: React.FC<DeckBrowserProps> = ({ userID }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const { getDecks, createDeck, deleteDeck } = useDeckAPI();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const fetchDecks = async () => {
            setIsLoading(true);
            try {
                const fetchedDecks = await getDecks();
                if (isMounted.current) setDecks(fetchedDecks || []);
            } catch (error) {
                console.error("Error fetching decks:", error);
                if (isMounted.current) showNotification('Failed to fetch decks.', 'error');
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };
        fetchDecks();

        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newDeck = await createDeck({ name, description });
            setDecks((prevDecks) => [...prevDecks, newDeck]);
            setName('');
            setDescription('');
            showNotification('Deck created successfully!', 'success');
        } catch (error) {
            console.error('Error creating deck:', error);
            showNotification('Failed to create deck.', 'error');
        }
    };

    const handleDeckClick = (deck: Deck) => {
        navigate(`/decks/${deck.id}`);
    };

    const handleDeleteDeck = async (e: React.MouseEvent, deckId: number) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this deck?')) {
            try {
                await deleteDeck(deckId);
                setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
                showNotification('Deck deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting deck:', error);
                showNotification('Failed to delete deck.', 'error');
            }
        }
    };

    return (
        <DeckBrowserContainer>
            <DeckBrowserTitle>Your Flashcard Decks</DeckBrowserTitle>
            
            <ContentLayout>
                {isLoading ? (
                    <LoadingText>Loading your decks...</LoadingText>
                ) : decks.length === 0 ? (
                    <EmptyStateText>You don't have any decks yet. Create your first deck to get started!</EmptyStateText>
                ) : (
                    <DeckGrid>
                        {decks.map((deck) => (
                            <DeckCard
                                key={deck.id}
                                onClick={() => handleDeckClick(deck)}
                            >
                                <div>
                                    <DeckName>{deck.name}</DeckName>
                                    {deck.description && (
                                        <DeckDescription>{deck.description}</DeckDescription>
                                    )}
                                    <DeckStatus>
                                        {deck.is_system ? 'System Deck' : deck.is_public ? 'Public Deck' : 'Private Deck'}
                                    </DeckStatus>
                                </div>
                                <DeckActionButtons>
                                    <ViewButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeckClick(deck);
                                        }}
                                    >
                                        View
                                    </ViewButton>
                                    {!deck.is_system && (
                                        <DeleteButton
                                            onClick={(e) => handleDeleteDeck(e, deck.id)}
                                        >
                                            Delete
                                        </DeleteButton>
                                    )}
                                </DeckActionButtons>
                            </DeckCard>
                        ))}
                    </DeckGrid>
                )}
                
                <CreateDeckForm onSubmit={handleCreateDeck}>
                    <FormTitle>Create New Deck</FormTitle>
                    <FormInput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Deck Name"
                        required
                    />
                    <FormInput
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                    />
                    <CreateButton type="submit">
                        Create Deck
                    </CreateButton>
                </CreateDeckForm>
            </ContentLayout>
        </DeckBrowserContainer>
    );
};

export default DeckBrowser;