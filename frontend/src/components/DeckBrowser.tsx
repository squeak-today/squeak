import React, { useState } from 'react';
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
    const [title, setTitle] = useState<string>('');
    const [language, setLanguage] = useState<string>('');

    const { createDeck } = useDeckAPI();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newDeck = await createDeck({ title, language, is_public: false });
            setDecks((prevDecks) => [...prevDecks, newDeck]);
            setTitle('');
            setLanguage('');
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
                                <h3>{deck.title}</h3>
                                <p>Language: {deck.language}</p>
                                <p>{deck.is_public ? 'Public' : 'Private'}</p>
                            </DeckItem>
                        ))}
                    </DeckList>
                )}
                <form onSubmit={handleCreateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Deck Title"
                        required
                    />
                    <input
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="Language"
                        required
                    />
                    <button type="submit">Create Deck</button>
                </form>
            </div>
        </Container>
    );
};

export default DeckBrowser;