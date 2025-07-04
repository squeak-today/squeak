import React, { useState } from 'react';
import { Flashcard } from '../../types/flashcard.types';
import FlashcardCard from './FlashcardCard';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface FlashcardListProps {
    flashcards: Flashcard[];
    onEdit: (card: Flashcard) => void;
    onDelete: (id: number) => void;
    isPublic?: boolean;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ 
    flashcards, 
    onEdit, 
    onDelete,
    isPublic = false
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    
    // Pagination logic
    const totalFlashcards = flashcards.length;
    const totalPages = Math.ceil(totalFlashcards / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFlashcards = flashcards.slice(startIndex, startIndex + itemsPerPage);

    if (flashcards.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-['Lora',_serif] font-semibold mb-4 text-black">Flashcards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedFlashcards.map((card) => (
                    <FlashcardCard 
                        key={card.id} 
                        card={card} 
                        onEdit={onEdit} 
                        onDelete={onDelete}
                        isPublic={isPublic}
                    />
                ))}
            </div>
            
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

export default FlashcardList;