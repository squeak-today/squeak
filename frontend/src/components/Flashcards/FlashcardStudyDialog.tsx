import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Flashcard } from '@/types/flashcard.types';
import './FlashcardStyles.css'; 

interface FlashcardStudyDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    flashcards: Flashcard[];
}

const FlashcardStudyDialog: React.FC<FlashcardStudyDialogProps> = ({ 
    isOpen, 
    setIsOpen, 
    flashcards 
}) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);
    
    const currentCard = flashcards[currentCardIndex];
    const totalCards = flashcards.length;
    
    // Reset card when changing index
    useEffect(() => {
        setShowBack(false);
    }, [currentCardIndex]);
    
    const handleNext = () => {
        setCurrentCardIndex((prev) => (prev + 1) % totalCards);
    };
    
    const handlePrevious = () => {
        setCurrentCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
                className="font-['Montserrat',_sans-serif] sm:max-w-[600px] w-[90vw] p-0 bg-white"
            >
                <div className="p-6 w-full">
                    <DialogHeader className="mb-4 flex flex-row justify-between items-center">
                        <DialogTitle className="text-2xl font-['Lora',_serif] font-bold text-black">
                            Study Flashcards
                        </DialogTitle>
                        <div className="text-[#333333]">
                            Card {currentCardIndex + 1} of {totalCards}
                        </div>
                    </DialogHeader>

                    {currentCard && (
                        <div className="w-full">
                            <div 
                                className="w-full h-64 cursor-pointer perspective-1000"
                                onClick={() => setShowBack(!showBack)}
                            >
                                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${showBack ? 'rotate-y-180' : ''}`}>
                                    {/* Front of Card */}
                                    <div className="absolute w-full h-full backface-hidden bg-white border-2 border-[#fad48f] rounded-lg shadow-md">
                                        <div className="h-full flex items-center justify-center p-6">
                                            <div className="text-center">
                                                <p className="text-[#333333] text-lg">
                                                    {currentCard.front_content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Back of Card */}
                                    <div className="absolute w-full h-full backface-hidden bg-white border-2 border-[#fad48f] rounded-lg shadow-md rotate-y-180">
                                        <div className="h-full flex items-center justify-center p-6">
                                            <div className="text-center">
                                                <p className="text-[#333333] text-lg">
                                                    {currentCard.back_content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-center text-[#666666] mt-2">
                                Click the card to flip it
                            </p>
                            
                            <div className="flex justify-between mt-6">
                                <Button
                                    onClick={handlePrevious}
                                    className="px-4 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FlashcardStudyDialog;