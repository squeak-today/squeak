import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDeckAPI } from '@/hooks/useDeckAPI';
import { useNotification } from '@/context/NotificationContext';
import { Button } from "@/components/ui/button";
import { DeckWithCards, Flashcard } from '@/types/flashcard.types';

import FlashcardStudyDialog from '../components/Flashcards/FlashcardStudyDialog';
import FlashcardFormDialog from '../components/Flashcards/FlashcardFormDialog';
import FlashcardList from '../components/Flashcards/FlashcardList';

const DeckView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getDeck, createFlashcard, updateFlashcard, deleteFlashcard } = useDeckAPI();
    const { showNotification } = useNotification();
    const [deck, setDeck] = useState<DeckWithCards | null>(null);
    const [isStudyDialogOpen, setIsStudyDialogOpen] = useState(false);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { backTo?: string } | null;

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const deckData = await getDeck(Number(id));
                if (!deckData.flashcards) deckData.flashcards = [];
                setDeck(deckData);
                if (deckData.flashcards.length === 0) setIsFormDialogOpen(true);
            } catch (error) {
                console.error('Error fetching deck:', error);
                showNotification('Failed to fetch deck.', 'error');
            }
        };
        fetchDeck();
    }, []);

    const handleCreateFlashcard = async (frontContent: string, backContent: string) => {
        try {
            const newCard = await createFlashcard({
                deck_id: Number(id),
                front_content: frontContent,
                back_content: backContent,
            });
            setDeck((prev) => prev ? { ...prev, flashcards: [...prev.flashcards, newCard] } : prev);
            setIsFormDialogOpen(false);
            showNotification('Flashcard created!', 'success');
        } catch (error) {
            showNotification('Failed to create flashcard.', 'error');
        }
    };

    const handleUpdateFlashcard = async (frontContent: string, backContent: string) => {
        if (!editingCard) return;
        try {
            await updateFlashcard(editingCard.id, {
                front_content: frontContent,
                back_content: backContent,
            });
            setDeck((prev) =>
                prev
                    ? {
                        ...prev,
                        flashcards: prev.flashcards.map((card) =>
                            card.id === editingCard.id ? { ...card, front_content: frontContent, back_content: backContent } : card
                        ),
                    }
                    : prev
            );
            setEditingCard(null);
            setIsFormDialogOpen(false);
            showNotification('Flashcard updated!', 'success');
        } catch (error) {
            showNotification('Failed to update flashcard.', 'error');
        }
    };

    const handleDeleteFlashcard = async (flashcardId: number) => {
        if (window.confirm('Delete this flashcard?')) {
            try {
                await deleteFlashcard(flashcardId);
                setDeck((prev) =>
                    prev ? { ...prev, flashcards: prev.flashcards.filter((card) => card.id !== flashcardId) } : prev
                );
                showNotification('Flashcard deleted!', 'success');
            } catch (error) {
                showNotification('Failed to delete flashcard.', 'error');
            }
        }
    };

    const handleSubmitForm = (frontContent: string, backContent: string) => {
        if (editingCard) {
            handleUpdateFlashcard(frontContent, backContent);
        } else {
            handleCreateFlashcard(frontContent, backContent);
        }
    };

    const handleEditCard = (card: Flashcard) => {
        setEditingCard(card);
        setIsFormDialogOpen(true);
    };

    if (!deck) return <div className="max-w-7xl mx-auto px-4 py-8 font-sans">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 font-['Montserrat',_sans-serif]">
            <Button 
                onClick={() => navigate(state?.backTo || '/learn')}
                variant="outline"
                className="flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-[#e0e0e0] rounded-md hover:bg-[#fbfbfb] text-[#333333]"
            >
                ← Back to Decks
            </Button>
            
            <div className="mb-8">
                <h1 className="text-3xl font-['Lora',_serif] font-bold mb-2 text-black">{deck.name}</h1>
                <p className="text-[#333333]">{deck.description}</p>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
                <Button 
                    onClick={() => setIsStudyDialogOpen(true)}
                    className="px-6 py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                    disabled={deck.flashcards.length === 0}
                >
                    Study Flashcards
                </Button>
                
                {/* Flashcard Study Dialog */}
                {deck.flashcards.length > 0 && (
                    <FlashcardStudyDialog 
                        isOpen={isStudyDialogOpen} 
                        setIsOpen={setIsStudyDialogOpen} 
                        flashcards={deck.flashcards} 
                    />
                )}
                
                {/* Create/Edit Flashcard Dialog */}
                <Button 
                    className="px-6 py-3 bg-[#E6F4EA] hover:bg-[#d7eadd] text-[#1B873B] rounded-md transition-colors"
                    onClick={() => {
                        setEditingCard(null);
                        setIsFormDialogOpen(true);
                    }}
                >
                    Add Flashcard
                </Button>
                
                <FlashcardFormDialog 
                    isOpen={isFormDialogOpen}
                    setIsOpen={setIsFormDialogOpen}
                    editingCard={editingCard}
                    onSubmit={handleSubmitForm}
                />
            </div>

            {deck.flashcards.length > 0 ? (
                /* Flashcard List with Pagination */
                <FlashcardList 
                    flashcards={deck.flashcards}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteFlashcard}
                />
            ) : (
                <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center shadow-sm">
                    <h2 className="text-xl font-['Lora',_serif] font-semibold mb-3 text-black">No Flashcards Yet</h2>
                    <p className="text-[#666666] mb-6">This deck doesn't have any flashcards yet. Add your first flashcard to get started!</p>
                    <Button 
                        onClick={() => {
                            setEditingCard(null);
                            setIsFormDialogOpen(true);
                        }}
                        className="px-6 py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                    >
                        Add Your First Flashcard
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DeckView;