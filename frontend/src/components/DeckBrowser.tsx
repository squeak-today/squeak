import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckAPI } from '../hooks/useDeckAPI';
import { useNotification } from '../context/NotificationContext';
import { Container, Title, DeckList, DeckItem, NoDecksMessage } from '../styles/components/DeckBrowserStyles';

interface Deck {
    id: string;
    name: string;  
    is_public: boolean;
    user_id: string;
    created_at: string;
}

interface DeckBrowserProps {
    userID: string;
}

const DeckBrowser: React.FC<DeckBrowserProps> = ({ userID }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [name, setName] = useState<string>('');  // Changed from title to name
    const [description, setDescription] = useState<string>('');  // Added description

    const { createDeck } = useDeckAPI();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

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
                                <h3>{deck.name}</h3>  // Changed from title to name
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