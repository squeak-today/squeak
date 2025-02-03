import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

import rightArrow from '../assets/vectors/rightArrow.svg';
import leftArrow from '../assets/vectors/leftArrow.svg';

// 1) Import your existing TranslationPanel
import TranslationPanel from './TranslationPanel';

const StoryBox = styled.div`
  padding: 20px;
  margin: 0px 0;
  border-radius: 15px; // Rounded corners
  background-color: white;
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const StoryText = styled.div`
  text-align: left;
  line-height: 1.5;
  white-space: normal; // Ensure text wraps at word boundaries
  word-break: keep-all; // Prevent breaking words in the middle
  overflow-wrap: normal; // Prevent breaking words unnecessarily
  flex-wrap: wrap; // Enable wrapping within the flex container
`;

const SectionButton = styled.button`
  background-color: #5c5b5b;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1.25em;
  display: flex;
  align-items: center;
`;

const LeftArrow = styled.img`
  margin-right: 8px;
`;
const RightArrow = styled.img`
  margin-left: 8px;
`;

const MarkdownWord = styled.span`
  display: inline;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background-color: #5c5b5b;
  border-radius: 5px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const PageButton = ({ isNext, onClick }) => {
  const label = isNext ? 'Next' : 'Previous';
  const icon = isNext ? rightArrow : leftArrow;
  return (
    <SectionButton onClick={onClick}>
      {!isNext && <LeftArrow src={icon} alt="Left Arrow" />}
      {label}
      {isNext && <RightArrow src={icon} alt="Right Arrow" />}
    </SectionButton>
  );
};

/* ---------------------------------------------
   ClickableText: Wraps each word with a span
   that calls handleWordClick on user click
   --------------------------------------------- */
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
          onClick={(e) => handleWordClick(e, word.trim(), text, sourceLanguage)}
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
        React.Children.map(node.props.children, (child) => processNode(child))
      );
    }
    return node;
  };

  return <p>{React.Children.map(children, (child) => processNode(child))}</p>;
};

/* ---------------------------------------------
   STORYREADER: Where we manage pagination
               and show the TranslationPanel
   --------------------------------------------- */
const StoryReader = ({ data, handleWordClick, sourceLanguage }) => {
  const [sectionIndex, setSectionIndex] = useState(0);
  // Break up the text into smaller sections
  const textSections = data.match(/[^.!?]+[.!?]*\s*/g) || [];

  const storyBoxRef = useRef(null);

  const scrollToTop = () => {
    storyBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNext = () => {
    if (sectionIndex + 1 < textSections.length) {
      setSectionIndex(sectionIndex + 1);
      scrollToTop();
    }
  };

  const handlePrevious = () => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
      scrollToTop();
    }
  };

  const progress = ((sectionIndex + 1) / textSections.length) * 100;

  /* --------------------------------------------------------
     State for showing the translation panel
     (These 2 states "showPanel" + "panelData" control it)
     -------------------------------------------------------- */
  const [showPanel, setShowPanel] = useState(false);
  const [panelData, setPanelData] = useState({
    word: '',
    wordTranslation: '',
    originalSentence: '',
    sentenceTranslation: ''
  });

  // Wrap the parent's handleWordClick so we can store
  // the returned translation data locally and show the panel
  const localHandleWordClick = async (e, clickedWord, sentence, lang) => {
    // handleWordClick in the parent returns an object:
    // { wordTranslation, sentenceTranslation }
    const result = await handleWordClick(e, clickedWord, sentence, lang);

    // Save data into our local state so we can show the panel
    setPanelData({
      word: clickedWord,
      wordTranslation: result.wordTranslation,
      originalSentence: sentence,
      sentenceTranslation: result.sentenceTranslation
    });

    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
  };

  return (
    <StoryBox ref={storyBoxRef}>
      <ProgressBarContainer>
        <ProgressBarFill progress={progress} />
      </ProgressBarContainer>

      <StoryText>
        <ReactMarkdown
          components={{
            p(props) {
              return (
                <ClickableText
                  handleWordClick={localHandleWordClick}
                  sourceLanguage={sourceLanguage}
                  {...props}
                />
              );
            }
          }}
        >
          {textSections[sectionIndex]}
        </ReactMarkdown>
      </StoryText>

      <ButtonBox>
        <PageButton isNext={false} onClick={handlePrevious} />
        <PageButton isNext={true} onClick={handleNext} />
      </ButtonBox>

      {/* Show the translation panel if "showPanel" is true */}
      {showPanel && (
        <TranslationPanel data={panelData} onClose={closePanel} />
      )}
    </StoryBox>
  );
};

export default StoryReader;
