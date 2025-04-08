import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckAPI } from '../hooks/useDeckAPI';
import { useNotification } from '../context/NotificationContext';
import { Container, Title, DeckList, DeckItem, NoDecksMessage } from '../styles/components/DeckBrowserStyles';

interface Deck {
    id: number; // Change from string to number
    name: string;
    description: string;
    is_public: boolean;
    is_system: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface DeckBrowserProps {
    userID: string; // May not be needed if backend uses context
}

const DeckBrowser: React.FC<DeckBrowserProps> = ({ userID }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const { getDecks, createDeck } = useDeckAPI();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const fetchDecks = async () => {
            setIsLoading(true);
            try {
                const fetchedDecks = await getDecks();
                if (isMounted.current) {
                    setDecks(fetchedDecks || []);
                }
            } catch (error) {
                console.error("Error fetching decks:", error);
                if (isMounted.current) {
                    showNotification('Failed to fetch decks.', 'error');
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };
        fetchDecks();
        return () => {
            isMounted.current = false;
        };
    }, [getDecks, showNotification]); // Add showNotification to deps if it’s stable

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
            showNotification('Failed to create deck. Please try again.', 'error');
        }
    };

    const handleDeckClick = (deck: Deck) => {
        navigate(`/decks/${deck.id}`);
    };

    return (
        <Container>
            <Title>Your Decks</Title>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'flex-start' }}>
                {decks.length === 0 ? (
                    <NoDecksMessage>No decks available yet!</NoDecksMessage>
                ) : (
                    <DeckList>
                        {decks.map((deck) => (
                            <DeckItem key={deck.id} onClick={() => handleDeckClick(deck)}>
                                <h3>{deck.name}</h3>
                                <p>{deck.is_public ? 'Public' : 'Private'}</p>
                            </DeckItem>
                        ))}
                    </DeckList>
                )}
                <form onSubmit={handleCreateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Deck Name"
                        required
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                    />
                    <button type="submit">Create Deck</button>
                </form>
            </div>
        </Container>
    );
};

export default DeckBrowser;