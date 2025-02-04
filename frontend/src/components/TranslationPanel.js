// TranslationPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  position: fixed;
  background: #2F3C32;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 700px;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  /* position above the clicked word if near the bottom of the screen */
  ${props => {
    const viewportHeight = window.innerHeight;
    const shouldShowAbove = props.$top + props.$panelHeight > viewportHeight;
    const gap = 10;
    const wordHeight = 20;
    
    return `
      top: ${shouldShowAbove 
        ? `${props.$top - props.$panelHeight - gap - wordHeight}px` 
        : `${props.$top + gap}px`
      };
      left: ${props.$left}px;
    `;
  }}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Word = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  word-break: break-word;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
`;

const TranslationText = styled.div`
  font-style: italic;
  margin: 8px 0 12px;
`;

const Button = styled.button`
  background: none;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
`;

const Sentence = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  line-height: 1.4;

  & + & {
    margin-top: 12px;
  }
`;

function TranslationPanel({ data, onClose, style, handleSentenceToggle }) {
  const [showSentences, setShowSentences] = useState(false);
  const [panelHeight, setPanelHeight] = useState(120); // default base height
  const panelRef = useRef(null);

  const handleToggle = async () => {
    await handleSentenceToggle();
    setShowSentences(prev => !prev);
  };

  useEffect(() => {
    if (panelRef.current) {
      setPanelHeight(panelRef.current.offsetHeight);
    }
  }, [showSentences, data.word]); // re-measure when sentences are toggled or word changes

  useEffect(() => {
    console.log(data.word);
    setShowSentences(false);
  }, [data.word]);

  return (
    <Panel 
      ref={panelRef}
      $top={style.top}
      $left={style.left}
      $showSentences={showSentences}
      $panelHeight={panelHeight}
    >
      <Header>
        <Word>{data.word}</Word>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Header>
      
      <TranslationText>{data.wordTranslation}</TranslationText>
      
      <Button onClick={handleToggle}>
        {showSentences ? 'Hide Sentence' : 'Show Sentence'}
      </Button>

      {showSentences && (
        <>
          <Sentence>
            <strong>Original</strong><br />
            {data.originalSentence}
          </Sentence>
          <Sentence>
            <strong>Translated</strong><br />
            {data.sentenceTranslation}
          </Sentence>
        </>
      )}
    </Panel>
  );
}

export default TranslationPanel;
