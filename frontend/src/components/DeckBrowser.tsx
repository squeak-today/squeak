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
    const [currentPage, setCurrentPage] = useState(1);
    const decksPerPage = 9;

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

    // Pagination logic
    const indexOfLastDeck = currentPage * decksPerPage;
    const indexOfFirstDeck = indexOfLastDeck - decksPerPage;
    const currentDecks = decks.slice(indexOfFirstDeck, indexOfLastDeck);
    const totalPages = Math.ceil(decks.length / decksPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Card badge for deck type
    const getDeckBadge = (deck: Deck) => {
        if (deck.is_system) {
            return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">System Deck</span>;
        } else if (deck.is_public) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Public Deck</span>;
        } else {
            return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Private Deck</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 font-['Montserrat',_sans-serif]">
            <h1 className="text-3xl font-['Lora',_serif] font-bold mb-6 text-black">Your Flashcard Decks</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {isLoading ? (
                    <div className="flex-1 text-gray-600">Loading your decks...</div>
                ) : decks.length === 0 ? (
                    <div className="flex-1 text-gray-600">You don't have any decks yet. Create your first deck to get started!</div>
                ) : (
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentDecks.map((deck) => (
                                <div 
                                    key={deck.id}
                                    onClick={() => handleDeckClick(deck)}
                                    className="bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-shadow cursor-pointer h-64 flex flex-col overflow-hidden"
                                >
                                    {/* Card header with visual indicator for deck type */}
                                    <div className="h-2 bg-[#fad48f] w-full"></div>
                                    
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="mb-1">{getDeckBadge(deck)}</div>
                                        <h3 className="text-base font-['Lora',_serif] font-semibold mt-2 text-black">{deck.name}</h3>
                                        
                                        {deck.description && (
                                            <p className="text-[#333333] mt-2 line-clamp-2 text-sm font-['Montserrat',_sans-serif]">{deck.description}</p>
                                        )}
                                        
                                        <div className="mt-auto pt-4 flex space-x-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeckClick(deck);
                                                }}
                                                className="flex-1 px-4 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors font-['Montserrat',_sans-serif]"
                                            >
                                                View
                                            </button>
                                            {!deck.is_system && (
                                                <button
                                                    onClick={(e) => handleDeleteDeck(e, deck.id)}
                                                    className="flex-1 px-4 py-2 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333333] rounded-md transition-colors font-['Montserrat',_sans-serif]"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Create deck card - same height as deck cards */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-64 flex flex-col overflow-hidden">
                                <div className="h-2 bg-green-200 w-full"></div>
                                <div className="p-5 flex flex-col h-full">
                                    <h3 className="text-base font-['Lora',_serif] font-semibold mb-3 text-black">Create New Deck</h3>
                                    <form onSubmit={handleCreateDeck} className="flex flex-col h-full">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Deck Name"
                                            required
                                            className="p-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fad48f] focus:border-transparent mb-3 font-['Montserrat',_sans-serif]"
                                        />
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Description (optional)"
                                            className="p-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fad48f] focus:border-transparent font-['Montserrat',_sans-serif]"
                                        />
                                        <button
                                            type="submit"
                                            className="mt-auto p-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors font-['Montserrat',_sans-serif]"
                                        >
                                            Create Deck
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <nav className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded-md ${
                                            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: totalPages }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => paginate(index + 1)}
                                            className={`px-3 py-1 rounded-md ${
                                                currentPage === index + 1 
                                                    ? 'bg-yellow-200 text-gray-800' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    
                                    <button 
                                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded-md ${
                                            currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeckBrowser;