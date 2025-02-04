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
    &:hover {
        text-decoration: underline;
    }
`;

const ClickableText = ({ children, handleWordClick, sourceLanguage }) => {
    const renderWords = (text) => {
        const words = text.split(/(\s+)/);
        return words.map((word, index) => {
            if (word.trim() === '') {
                return word;
            }
            return (
                <MarkdownWord
                    key={index}
                    onClick={(e) => handleWordClick(e, word.trim(), sourceLanguage)}
                    className="word"
                >
                    {word}
                </MarkdownWord>
            );
        });
    };

    const processNode = (node) => {
        if (typeof node === 'string') {
            return renderWords(node);
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
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </p>
                            ),
                            // Handle list items
                            li: (props) => (
                                <li>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </li>
                            ),
                            // Handle headers
                            h1: (props) => (
                                <h1>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h1>
                            ),
                            h2: (props) => (
                                <h2>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h2>
                            ),
                            h3: (props) => (
                                <h3>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h3>
                            ),
                            h4: (props) => (
                                <h4>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h4>
                            ),
                            h5: (props) => (
                                <h5>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h5>
                            ),
                            h6: (props) => (
                                <h6>
                                    <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />
                                </h6>
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
