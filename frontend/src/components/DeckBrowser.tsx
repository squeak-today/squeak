import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckAPI } from '@/hooks/useDeckAPI';
import { useNotification } from '@/context/NotificationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus } from 'lucide-react';
import { JSX } from 'react';

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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private'>('all');
    
    const decksPerPage = 6; // Changed to 6 per your requirement

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
            setIsCreateDialogOpen(false);
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
        
        // Find the deck to check if it's public
        const deckToDelete = decks.find(deck => deck.id === deckId);
        
        if (deckToDelete?.is_public) {
            showNotification('Public decks cannot be deleted.', 'error');
            return;
        }
        
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

    // Filter decks based on active tab
    const filteredDecks = decks.filter(deck => {
        if (activeTab === 'all') return true;
        if (activeTab === 'public') return deck.is_public;
        if (activeTab === 'private') return !deck.is_public && !deck.is_system;
        return true;
    });

    // Pagination logic
    const indexOfLastDeck = currentPage * decksPerPage;
    const indexOfFirstDeck = indexOfLastDeck - decksPerPage;
    const currentDecks = filteredDecks.slice(indexOfFirstDeck, indexOfLastDeck);
    const totalPages = Math.ceil(filteredDecks.length / decksPerPage);

    // Reset to page 1 when changing tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-['Lora',_serif] font-bold text-black">Your Flashcard Decks</h1>
                
                <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="px-6 py-3 bg-[#E6F4EA] hover:bg-[#d7eadd] text-[#1B873B] rounded-md transition-colors"
                >
                <Plus className="w-5 h-5 mr-2" size={20} />
                    Create New Deck
                </Button>
            </div>
            
            {/* Create Deck Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="font-['Montserrat',_sans-serif] sm:max-w-[550px] w-[90vw] p-0 bg-white">
                    <div className="p-6 w-full">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-3xl font-['Lora',_serif] font-bold text-black">
                                Create New Deck
                            </DialogTitle>
                            <DialogDescription className="text-[#333333] text-base">
                                Fill out the form below to create a new flashcard deck.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleCreateDeck} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="deck_name" className="text-black font-medium">
                                    Deck Name
                                </Label>
                                <Input
                                    id="deck_name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter a name for your deck"
                                    required
                                    className="w-full p-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fad48f]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deck_description" className="text-black font-medium">
                                    Description (Optional)
                                </Label>
                                <Input
                                    id="deck_description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe your deck"
                                    className="w-full p-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fad48f]"
                                />
                            </div>
                            
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors font-medium text-base"
                                >
                                    Create Deck
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Tabs for filtering decks */}
            <Tabs defaultValue="all" className="mb-8" onValueChange={(value) => setActiveTab(value as 'all' | 'public' | 'private')}>
                <TabsList className="bg-[#f5f5f5] p-1 rounded-lg">
                    <TabsTrigger 
                        value="all" 
                        className="data-[state=active]:bg-[#fad48f] data-[state=active]:text-black rounded-md px-6 py-2 text-[#333333]"
                    >
                        All Decks
                    </TabsTrigger>
                    <TabsTrigger 
                        value="public" 
                        className="data-[state=active]:bg-[#fad48f] data-[state=active]:text-black rounded-md px-6 py-2 text-[#333333]"
                    >
                        Public Decks
                    </TabsTrigger>
                    <TabsTrigger 
                        value="private" 
                        className="data-[state=active]:bg-[#fad48f] data-[state=active]:text-black rounded-md px-6 py-2 text-[#333333]"
                    >
                        Private Decks
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                    {isLoading ? (
                        <div className="text-gray-600">Loading your decks...</div>
                    ) : filteredDecks.length === 0 ? (
                        <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center shadow-sm">
                            <h2 className="text-xl font-['Lora',_serif] font-semibold mb-3 text-black">No Decks Yet</h2>
                            <p className="text-[#666666] mb-6">You don't have any decks yet. Create your first deck to get started!</p>
                            <Button 
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="px-6 py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                            >
                                Create Your First Deck
                            </Button>
                        </div>
                    ) : (
                        <DeckGrid 
                            decks={currentDecks}
                            onDeckClick={handleDeckClick}
                            onDeleteDeck={handleDeleteDeck}
                            getDeckBadge={getDeckBadge}
                        />
                    )}
                </TabsContent>
                
                <TabsContent value="public" className="mt-6">
                    {isLoading ? (
                        <div className="text-gray-600">Loading your decks...</div>
                    ) : filteredDecks.length === 0 ? (
                        <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center shadow-sm">
                            <h2 className="text-xl font-['Lora',_serif] font-semibold mb-3 text-black">No Public Decks</h2>
                            <p className="text-[#666666] mb-6">You don't have any public decks yet.</p>
                            <Button 
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="px-6 py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                            >
                                Create a Public Deck
                            </Button>
                        </div>
                    ) : (
                        <DeckGrid 
                            decks={currentDecks}
                            onDeckClick={handleDeckClick}
                            onDeleteDeck={handleDeleteDeck}
                            getDeckBadge={getDeckBadge}
                        />
                    )}
                </TabsContent>
                
                <TabsContent value="private" className="mt-6">
                    {isLoading ? (
                        <div className="text-gray-600">Loading your decks...</div>
                    ) : filteredDecks.length === 0 ? (
                        <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center shadow-sm">
                            <h2 className="text-xl font-['Lora',_serif] font-semibold mb-3 text-black">No Private Decks</h2>
                            <p className="text-[#666666] mb-6">You don't have any private decks yet.</p>
                            <Button 
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="px-6 py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                            >
                                Create a Private Deck
                            </Button>
                        </div>
                    ) : (
                        <DeckGrid 
                            decks={currentDecks}
                            onDeckClick={handleDeckClick}
                            onDeleteDeck={handleDeleteDeck}
                            getDeckBadge={getDeckBadge}
                        />
                    )}
                </TabsContent>
            </Tabs>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mt-6">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                size="default"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className={`px-4 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors ${
                                    currentPage === 1 ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    size="default"
                                    onClick={() => setCurrentPage(i + 1)}
                                    isActive={currentPage === i + 1}
                                    className={currentPage === i + 1 
                                        ? 'bg-[#f8c976] text-black' 
                                        : 'bg-white text-[#333333] hover:bg-[#fad48f]'
                                    }
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                            <PaginationNext 
                                size="default"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                className={`px-4 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors ${
                                    currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

// Extracted DeckGrid component to reduce repetition
interface DeckGridProps {
    decks: Deck[];
    onDeckClick: (deck: Deck) => void;
    onDeleteDeck: (e: React.MouseEvent, deckId: number) => void;
    getDeckBadge: (deck: Deck) => JSX.Element;
}

const DeckGrid: React.FC<DeckGridProps> = ({ decks, onDeckClick, onDeleteDeck, getDeckBadge }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
                <div 
                    key={deck.id}
                    onClick={() => onDeckClick(deck)}
                    className="bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-shadow cursor-pointer h-64 flex flex-col overflow-hidden"
                >
                    {/* Card header with visual indicator for deck type */}
                    <div className="h-2 bg-[#fad48f] w-full"></div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                        <div className="mb-1">{getDeckBadge(deck)}</div>
                        <h3 className="text-lg font-['Lora',_serif] font-semibold mt-2 text-black">{deck.name}</h3>
                        
                        {deck.description && (
                            <p className="text-[#333333] mt-2 line-clamp-3 text-sm font-['Montserrat',_sans-serif]">{deck.description}</p>
                        )}
                        
                        <div className="mt-auto pt-4 flex space-x-3">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeckClick(deck);
                                }}
                                className={`${deck.is_public || deck.is_system ? 'w-full' : 'flex-1'} px-4 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors font-['Montserrat',_sans-serif]`}
                            >
                                View
                            </Button>
                            {!deck.is_system && !deck.is_public && (
                                <Button
                                    onClick={(e) => onDeleteDeck(e, deck.id)}
                                    variant="outline"
                                    className="flex-1 px-4 py-2 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333333] rounded-md transition-colors font-['Montserrat',_sans-serif]"
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DeckBrowser;