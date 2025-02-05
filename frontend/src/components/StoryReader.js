import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

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

const MarkdownWord = styled.span`
    display: inline;
    cursor: pointer;
    margin: -2px 0;
    padding: 2px 1px;
    border-radius: ${(props) => props.highlightRounding}px;
    transition: background-color 0.15s ease;

    &:hover {
        text-decoration: none;
        background-color: rgba(170, 255, 170, 0.6);
    }
`;

const ClickableText = ({ children, highlightRounding, handleWordClick, sourceLanguage }) => {
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
            return (
                <MarkdownWord
                    highlightRounding={highlightRounding}
                    key={index}
                    onClick={(e) => handleWordClick(e, word.trim(), sourceLanguage, sentence.trim())}
                    className="word"
                >
                    {word}
                </MarkdownWord>
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
    }
    
    return <>{React.Children.map(children, child => processNode(child))}</>;
};

const StoryReader = ({ content, handleWordClick, sourceLanguage, isLoading }) => {
    return (
        <StoryBox>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <StoryText>
                    <ReactMarkdown
                        components={{
                            // Handle paragraphs
                            p: (props) => (
                                <p>
                                    <ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </p>
                            ),
                            // Handle list items
                            li: (props) => (
                                <li>
                                    <ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </li>
                            ),
                            // Handle headers
                            h1: (props) => (
                                <h1>
                                    <ClickableText highlightRounding={10}handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h1>
                            ),
                            h2: (props) => (
                                <h2>
                                    <ClickableText highlightRounding={8} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h2>
                            ),
                            h3: (props) => (
                                <h3>
                                    <ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h3>
                            ),
                            h4: (props) => (
                                <h4>
                                    <ClickableText highlightRounding={5} handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h4>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </StoryText>
            )}
        </StoryBox>
    );
};

export default StoryReader;