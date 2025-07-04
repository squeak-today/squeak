export interface Flashcard {
    id: number;
    deck_id: number;
    front_content: string;
    back_content: string;
    source_url?: string;
    created_at: string;
    updated_at: string;
}

export interface DeckWithCards {
    id: number;
    name: string;
    description: string;
    flashcards: Flashcard[];
    is_public: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}