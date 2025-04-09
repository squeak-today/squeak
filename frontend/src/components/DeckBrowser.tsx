import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckAPI } from '../hooks/useDeckAPI';
import { useNotification } from '../context/NotificationContext';

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

    const handleDeleteDeck = async (deckId: number) => {
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Decks</h1>
            <div className="flex flex-row gap-6 items-start">
                {isLoading ? (
                    <p>Loading...</p>
                ) : decks.length === 0 ? (
                    <p className="text-gray-500">No decks available yet!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((deck) => (
                            <div
                                key={deck.id}
                                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <h3 className="text-lg font-semibold">{deck.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {deck.is_public ? 'Public' : 'Private'}
                                </p>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={() => handleDeckClick(deck)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDeck(deck.id);
                                        }}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleCreateDeck} className="flex flex-col gap-3 w-64">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Deck Name"
                        required
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Create Deck
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeckBrowser;