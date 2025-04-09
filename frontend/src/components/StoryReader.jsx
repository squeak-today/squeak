import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';

import {evaluate} from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'

import { QuickTipWidget, QuizInputWidget } from './StoryWidgets';

const StoryBox = styled.div`
	padding: 0px 10px;
    padding-bottom: 5px;
	margin: 0;
	border-radius: 15px; // Rounded corners
	background-color: white;
	overflow-y: auto;
`;

const StoryText = styled.div`
	text-align: left;
	line-height: 1.5;
	white-space: normal; // Ensure text wraps at word boundaries
	word-break: keep-all; // Prevent breaking words in the middle
	overflow-wrap: normal; // Prevent breaking words unnecessarily
	flex-wrap: wrap; // Enable wrapping within the flex container
`;

const ClickableText = ({ children, highlightRounding, handleWordClick, sourceLanguage, addWordRef, highlightedWords }) => {
    const getSentences = (text) => {
        // big regex for sentence detection:
        /**
         * global match all, not just first ('g')
         * Handle Spanish/French opening punctuation marks ¿¡
         * Match zero or more characters that aren't . ! ? or space
         * Look for sentence ending punctuation that isn't:
         *  - inside quotes (both "" and «»)
         *  - part of abbreviations like Mr. or decimal numbers
         * Match ending punctuation and quotes
         * Look for whitespace at the end of the string
         * Optimized for Latin-based languages Spanish and French
         */
        const regex = new RegExp(
            '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))',
            'g'
        );
        const sentences = text.match(regex) || [text];
        
        // Preserve the original spacing after sentences, including Spanish/French punctuation
        const spacingAfter = text.match(/[.!?]+\s*/g) || [];
        return sentences.map((sentence, i) => ({
            text: sentence,
            spacing: spacingAfter[i] ? spacingAfter[i].match(/\s+/)?.[0] || '' : ''
        }));
    };

    const renderWords = (text, sentence) => {
        const words = text.split(/(\s+)/);
        return words.map((word, index) => {
            if (word.trim() === '') {
                return word;
            }

            const roundingVariants = {
                5: 'rounded-[5px]', 
                8: 'rounded-[8px]',
                10: 'rounded-[10px]',
            }
            
            const wordKey = `${word.trim()}-${sentence.trim()}`;
            const isHighlighted = highlightedWords.has(wordKey);
            
            const setWordRef = (element) => {
                if (element && addWordRef && word.trim()) {
                    addWordRef({
                        word: word.trim(),
                        reference: element,
                        sentence: sentence.trim()
                    });
                }
            };
            
            return (
                <span
                    key={index}
                    ref={setWordRef}
                    onClick={(e) => handleWordClick(e, word.trim(), sourceLanguage, sentence.trim())}
                    className={`inline cursor-pointer -my-[2px] mx-0 py-[2px] px-[1px] ${roundingVariants[highlightRounding]} ${isHighlighted ? 'bg-[#fbd48f]' : 'bg-transparent'} transition-colors duration-150 ease-in hover:bg-[#fbd48f] word`}
                >
                    {word}
                </span>
            );
        });
    };

    const processNode = (node) => {
        if (typeof node === 'string') {
            const sentences = getSentences(node);
            return sentences.map((sentenceObj, index) => (
                <React.Fragment key={index}>
                    {renderWords(sentenceObj.text, sentenceObj.text)}
                    {sentenceObj.spacing}
                </React.Fragment>
            ));
        }
        if (React.isValidElement(node)) {
            return React.cloneElement(
                node,
                { ...node.props },
                React.Children.map(node.props.children, child => processNode(child))
            );
        }
        return node;
    };
    
    return <>{React.Children.map(children, child => processNode(child))}</>;
};

const createComponentOverrides = (handleWordClick, sourceLanguage, addWordRef, highlightedWords) => ({
    p: props => <p><ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></p>,
    li: props => <li><ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></li>,
    h1: props => <h1><ClickableText highlightRounding={10} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></h1>,
    h2: props => <h2><ClickableText highlightRounding={8} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></h2>,
    h3: props => <h3><ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></h3>,
    h4: props => <h4><ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></h4>,
    div: props => <div><ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></div>,
    span: props => <span><ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} addWordRef={addWordRef} highlightedWords={highlightedWords} {...props} /></span>,
});

const PageNavigationButton = styled.button`
    padding: 0.5em 1em;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    background: rgb(255, 255, 255);
    cursor: pointer;
    color: black;
    font-family: 'Lora', serif;
    font-size: 16px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-width: 100px;

    &:hover:not(:disabled) {
        background: rgb(228, 228, 228);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
        color: #999;
        box-shadow: none;
    }
`;

const PageControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 20px;
    font-family: 'Lora', serif;
`;

const PageNumber = styled.span`
    font-family: 'Lora', serif;
    font-size: 1.1em;
    color: #666;
`;

const StoryReader = ({ content, paged, onNeedPages, handleWordClick, sourceLanguage, isLoading }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [compiledPages, setCompiledPages] = useState(new Map());
    const [singleComponent, setSingleComponent] = useState(null);
    const [highlightedWords, setHighlightedWords] = useState(new Set());
    const wordElementsRef = useRef([]);
    const processedWordsRef = useRef(new Set());

    const addWordRef = (wordData) => {
        const wordKey = `${wordData.word}-${wordData.sentence}`;
        if (!processedWordsRef.current.has(wordKey)) {
            processedWordsRef.current.add(wordKey);
            wordElementsRef.current.push(wordData);
        }
    };

    const highlightWord = (index) => {
        if (wordElementsRef.current[index]) {
            const wordData = wordElementsRef.current[index];
            const wordKey = `${wordData.word}-${wordData.sentence}`;
            setHighlightedWords(prev => {
                const newHighlighted = new Set(prev);
                if (newHighlighted.has(wordKey)) {
                    newHighlighted.delete(wordKey);
                } else {
                    newHighlighted.add(wordKey);
                }
                return newHighlighted;
            });
        }
    }

    useEffect(() => {
        wordElementsRef.current = [];
        processedWordsRef.current.clear();
    }, [content, currentPage]);

    useEffect(() => {
        if ((paged === 0) && content) {
            const compileSingle = async () => {
                try {
                    const {default: MDXContent} = await evaluate(content, {
                        ...runtime,
                        useMDXComponents: () => ({
                            // components used in stories are defined here
                        })
                    });
                    setSingleComponent(() => MDXContent);
                } catch (error) {
                    console.error('Failed to compile content:', error);
                }
            };
            compileSingle();
        }
    }, [paged, content]);

    useEffect(() => {
        if ((paged === 0) || !content) return;

        const compileNewPages = async () => {
            const newPagesToCompile = Array.from(content.keys())
                .filter(pageNum => !compiledPages.has(pageNum));

            if (newPagesToCompile.length === 0) return;

            const compilationPromises = newPagesToCompile.map(async (pageNum) => {
                try {
                    const {default: MDXContent} = await evaluate(content.get(pageNum), {
                        ...runtime,
                        useMDXComponents: () => ({
                            QuickTipWidget,
                            QuizInputWidget
                        })
                    });
                    return [pageNum, MDXContent];
                } catch (error) {
                    console.error(`Failed to compile page ${pageNum}:`, error);
                    return [pageNum, null];
                }
            });

            const newCompiledPages = new Map(compiledPages);
            const results = await Promise.all(compilationPromises);
            results.forEach(([pageNum, component]) => {
                if (component) {
                    newCompiledPages.set(pageNum, component);
                }
            });

            setCompiledPages(newCompiledPages);
        };

        const clearUnneededPages = () => {
            const newCompiledPages = new Map(compiledPages);
            const pagesToKeep = [];
            for (let i = currentPage; i < currentPage + 3 && i < paged; i++) {
                pagesToKeep.push(i);
            }
            for (let i = currentPage - 1; i >= currentPage - 2 && i >= 0; i--) {
                pagesToKeep.push(i);
            }

            Array.from(newCompiledPages.keys()).forEach((pageNum) => {
                if (!pagesToKeep.includes(pageNum)) {
                    newCompiledPages.delete(pageNum);
                }
            })

            setCompiledPages(newCompiledPages);
        }

        compileNewPages();
        clearUnneededPages();
    // eslint-disable-next-line
    }, [paged, content]);

    const handleNextPage = async () => {
        const nextPage = currentPage + 1;
        if (nextPage < paged) {
            setCurrentPage(nextPage);
            await onNeedPages?.(nextPage, paged);
        }
    };

    const handlePrevPage = async () => {
        const prevPage = currentPage - 1;
        if (prevPage >= 0) {
            setCurrentPage(prevPage);
            await onNeedPages?.(prevPage, paged);
        }
    };

    const CurrentMDXComponent = (paged !== 0) ? compiledPages.get(currentPage) : singleComponent;

    return (
        <StoryBox>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div>
                    {(paged !== 0) && (
                        <PageControls>
                            <PageNavigationButton 
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </PageNavigationButton>
                            <PageNumber>Page {currentPage + 1}</PageNumber>
                            <PageNavigationButton 
                                onClick={handleNextPage}
                                disabled={currentPage + 1 >= paged}
                            >
                                Next
                            </PageNavigationButton>
                        </PageControls>
                    )}
                    <button onClick={() => highlightWord(2)}>Log word elements</button>
                    <StoryText>
                        {CurrentMDXComponent && 
                            <CurrentMDXComponent 
                                components={createComponentOverrides(handleWordClick, sourceLanguage, addWordRef, highlightedWords)}
                            />
                        }
                    </StoryText>
                </div>
            )}
        </StoryBox>
    );
};

export default StoryReader;
