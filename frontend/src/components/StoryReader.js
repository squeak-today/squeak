import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

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
    
    return <p>{React.Children.map(children, child => processNode(child))}</p>;
};

const StoryReader = ({ content, handleWordClick, sourceLanguage }) => {
    return (
        <StoryBox>
            <StoryText>
                <ReactMarkdown
                    components={{
                        p(props) { return <ClickableText handleWordClick={handleWordClick} sourceLanguage={sourceLanguage} {...props} />; }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </StoryText>
        </StoryBox>
    );
};

export default StoryReader;
