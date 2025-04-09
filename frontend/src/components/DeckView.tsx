import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDeckAPI } from '../hooks/useDeckAPI';
import { useNotification } from '../context/NotificationContext';
import FlashcardViewer from './FlashcardViewer';
import {
    DeckViewContainer,
    DeckTitle,
    DeckDescription,
    ActionButton,
    BackButton,
    EmptyDeckContainer,
    EmptyDeckText,
    FlashcardGrid,
    FlashcardItem,
    FlashcardFront,
    FlashcardBack,
    ButtonGroup,
    EditButton,
    DeleteButton,
    FormContainer,
    FormInput,
    SubmitButton,
    CancelButton
} from '../styles/DeckViewStyles';

interface Flashcard {
    id: number;
    deck_id: number;
    front_content: string;
    back_content: string;
    source_url?: string;
    created_at: string;
    updated_at: string;
}

interface DeckWithCards {
    id: number;
    name: string;
    description: string;
    flashcards: Flashcard[];
    is_public: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

const DeckView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getDeck, createFlashcard, updateFlashcard, deleteFlashcard } = useDeckAPI();
    const { showNotification } = useNotification();
    const [deck, setDeck] = useState<DeckWithCards | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { backTo?: string } | null;

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const deckData = await getDeck(Number(id));
                // Ensure flashcards is always an array
                if (!deckData.flashcards) {
                    deckData.flashcards = [];
                }
                setDeck(deckData);
            } catch (error) {
                console.error('Error fetching deck:', error);
                showNotification('Failed to fetch deck. It may not exist or you may not have access to it.', 'error');
            }
        };
        fetchDeck();
    }, [id]);

    const handleCreateFlashcard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newCard = await createFlashcard({
                deck_id: Number(id),
                front_content: newFront,
                back_content: newBack,
            });
            setDeck((prev) => prev ? { ...prev, flashcards: [...prev.flashcards, newCard] } : prev);
            setNewFront('');
            setNewBack('');
            showNotification('Flashcard created!', 'success');
        } catch (error) {
            showNotification('Failed to create flashcard.', 'error');
        }
    };

    const handleUpdateFlashcard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCard) return;
        try {
            await updateFlashcard(editingCard.id, {
                front_content: newFront,
                back_content: newBack,
            });
            setDeck((prev) =>
                prev
                    ? {
                          ...prev,
                          flashcards: prev.flashcards.map((card) =>
                              card.id === editingCard.id ? { ...card, front_content: newFront, back_content: newBack } : card
                          ),
                      }
                    : prev
            );
            setEditingCard(null);
            setNewFront('');
            setNewBack('');
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

    if (!deck) return <DeckViewContainer>Loading...</DeckViewContainer>;

    return (
        <DeckViewContainer>
            <BackButton onClick={() => navigate(state?.backTo || '/learn')}>
                ← Back to Browse
            </BackButton>
            
            <DeckTitle>{deck.name}</DeckTitle>
            <DeckDescription>{deck.description}</DeckDescription>
            
            <ActionButton onClick={() => setIsViewerOpen(true)}>
                Study
            </ActionButton>
            
            {deck.flashcards.length === 0 && (
                <EmptyDeckContainer>
                    <EmptyDeckText>This deck doesn't have any flashcards yet.</EmptyDeckText>
                    <EmptyDeckText>Use the form below to create your first flashcard!</EmptyDeckText>
                </EmptyDeckContainer>
            )}

            {/* Flashcard List */}
            <FlashcardGrid>
                {deck.flashcards.map((card) => (
                    <FlashcardItem key={card.id}>
                        <FlashcardFront>{card.front_content}</FlashcardFront>
                        <FlashcardBack>{card.back_content}</FlashcardBack>
                        <ButtonGroup>
                            <EditButton
                                onClick={() => {
                                    setEditingCard(card);
                                    setNewFront(card.front_content);
                                    setNewBack(card.back_content);
                                }}
                            >
                                Edit
                            </EditButton>
                            <DeleteButton
                                onClick={() => handleDeleteFlashcard(card.id)}
                            >
                                Delete
                            </DeleteButton>
                        </ButtonGroup>
                    </FlashcardItem>
                ))}
            </FlashcardGrid>

            {/* Flashcard Form */}
            <FormContainer onSubmit={editingCard ? handleUpdateFlashcard : handleCreateFlashcard}>
                <FormInput
                    type="text"
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Front Content"
                    required
                />
                <FormInput
                    type="text"
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Back Content"
                    required
                />
                <SubmitButton type="submit">
                    {editingCard ? 'Update Flashcard' : 'Create Flashcard'}
                </SubmitButton>
                {editingCard && (
                    <CancelButton
                        type="button"
                        onClick={() => {
                            setEditingCard(null);
                            setNewFront('');
                            setNewBack('');
                        }}
                    >
                        Cancel
                    </CancelButton>
                )}
            </FormContainer>

            {isViewerOpen && (
                <FlashcardViewer flashcards={deck.flashcards} onClose={() => setIsViewerOpen(false)} />
            )}
        </DeckViewContainer>
    );
};

export default DeckView;