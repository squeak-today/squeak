import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flashcard } from '../../types/flashcard.types';

interface FlashcardCardProps {
    card: Flashcard;
    onEdit: (card: Flashcard) => void;
    onDelete: (id: number) => void;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({ card, onEdit, onDelete }) => {
    return (
        <Card 
            key={card.id} 
            className="bg-white border border-[#e0e0e0] rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.15)] overflow-hidden"
        >
            <CardHeader className="p-5 pb-2">
                <CardTitle className="font-['Lora',_serif] font-semibold text-black text-lg">Front</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 pb-2">
                <p className="text-[#333333]">{card.front_content}</p>
            </CardContent>
            
            <div className="mx-5 h-px bg-[#e0e0e0]"></div>
            
            <CardHeader className="p-5 pb-2">
                <CardTitle className="font-['Lora',_serif] font-semibold text-black text-lg">Back</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
                <p className="text-[#333333]">{card.back_content}</p>
            </CardContent>
            <CardFooter className="p-5 pt-2 flex gap-2">
                <Button
                    onClick={() => onEdit(card)}
                    className="flex-1 px-3 py-2 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors"
                >
                    Edit
                </Button>
                <Button
                    onClick={() => onDelete(card.id)}
                    variant="outline"
                    className="flex-1 px-3 py-2 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333333] rounded-md transition-colors"
                >
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
};

export default FlashcardCard;