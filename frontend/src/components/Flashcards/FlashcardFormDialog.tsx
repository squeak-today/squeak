import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Flashcard } from '@/types/flashcard.types';

interface FlashcardFormDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    editingCard: Flashcard | null;
    onSubmit: (frontContent: string, backContent: string) => void;
}

const FlashcardFormDialog: React.FC<FlashcardFormDialogProps> = ({
    isOpen,
    setIsOpen,
    editingCard,
    onSubmit,
}) => {
    const [frontContent, setFrontContent] = useState('');
    const [backContent, setBackContent] = useState('');

    useEffect(() => {
        if (editingCard) {
            setFrontContent(editingCard.front_content);
            setBackContent(editingCard.back_content);
        } else {
            setFrontContent('');
            setBackContent('');
        }
    }, [editingCard, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(frontContent, backContent);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
                className="font-['Montserrat',_sans-serif] sm:max-w-[550px] w-[90vw] p-0 bg-white"
            >
                <div className="p-6 w-full">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-3xl font-['Lora',_serif] font-bold text-black">
                            {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
                        </DialogTitle>
                        <DialogDescription className="text-[#333333] text-base">
                            Fill out the form below to {editingCard ? 'update your' : 'create a new'} flashcard.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="front_content" className="text-black font-medium">
                                Front Content
                            </Label>
                            <Input
                                id="front_content"
                                value={frontContent}
                                onChange={(e) => setFrontContent(e.target.value)}
                                placeholder="Question or term"
                                required
                                className="w-full p-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fad48f]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="back_content" className="text-black font-medium">
                                Back Content
                            </Label>
                            <Input
                                id="back_content"
                                value={backContent}
                                onChange={(e) => setBackContent(e.target.value)}
                                placeholder="Answer or definition"
                                required
                                className="w-full p-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fad48f]"
                            />
                        </div>
                        
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full py-3 bg-[#fad48f] hover:bg-[#f8c976] text-black rounded-md transition-colors font-medium text-base"
                            >
                                {editingCard ? 'Update Flashcard' : 'Create Flashcard'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FlashcardFormDialog;