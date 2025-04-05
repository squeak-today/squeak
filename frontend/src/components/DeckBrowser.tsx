import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckAPI } from '../hooks/useDeckAPI';
import { useNotification } from '../context/NotificationContext';
import { Container, Title, DeckList, DeckItem, NoDecksMessage } from '../styles/components/DeckBrowserStyles';

interface Deck {
    id: string;
    title: string;
    language: string;
    is_public: boolean;
    user_id: string;
    created_at: string;
}

interface DeckBrowserProps {
    userID: string;
}

const DeckBrowser: React.FC<DeckBrowserProps> = ({ userID }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { getDecks } = useDeckAPI();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDecks = async () => {
            if (!userID) {
                setDecks([]);
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const decksData = await getDecks(userID);
                setDecks(decksData || []);
            } catch (error) {
                console.error('Error fetching decks:', error);
                if (error instanceof Error && error.message !== '404') { // Adjust based on getDecks error type
                    showNotification('Failed to load decks. Please try again.', 'error');
                }
                setDecks([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDecks();
    }, [userID, getDecks, showNotification]);

    const handleDeckClick = (deck: Deck) => {
        navigate(`/decks/${deck.id}`);
    };

    if (isLoading) {
        return (
            <Container>
                <Title>Your Decks</Title>
                <NoDecksMessage>Loading decks...</NoDecksMessage>
            </Container>
        );
    }

    if (decks.length === 0) {
        return (
            <Container>
                <Title>Your Decks</Title>
                <NoDecksMessage>No decks available yet!</NoDecksMessage>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Your Decks</Title>
            <DeckList>
                {decks.map((deck) => (
                    <DeckItem key={deck.id} onClick={() => handleDeckClick(deck)}>
                        <h3>{deck.title}</h3>
                        <p>Language: {deck.language}</p>
                        <p>{deck.is_public ? 'Public' : 'Private'}</p>
                    </DeckItem>
                ))}
            </DeckList>
        </Container>
    );
};

export default DeckBrowser;