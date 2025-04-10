import React, { useState } from 'react';

interface Flashcard {
    id: number;
    front_content: string;
    back_content: string;
}

interface FlashcardViewerProps {
    flashcards: Flashcard[];
    onClose: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (flashcards.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                    <p>No flashcards available.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    const handleFlip = () => setIsFlipped(!isFlipped);
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        setIsFlipped(false);
    };
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        setIsFlipped(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <div
                    className="relative h-64 w-full bg-gray-100 rounded-lg cursor-pointer overflow-hidden"
                    onClick={handleFlip}
                >
                    <div
                        className={`absolute inset-0 transition-transform duration-500 transform ${
                            isFlipped ? 'rotate-y-180' : ''
                        }`}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 flex items-center justify-center p-4 backface-hidden">
                            <p className="text-lg">{currentCard.front_content}</p>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 flex items-center justify-center p-4 backface-hidden rotate-y-180">
                            <p className="text-lg">{currentCard.back_content}</p>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Card {currentIndex + 1} of {flashcards.length}
                </p>
                <div className="mt-4 flex justify-between">
                    <button
                        onClick={handlePrev}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Finish
                </button>
            </div>
        </div>
    );
};

export default FlashcardViewer;