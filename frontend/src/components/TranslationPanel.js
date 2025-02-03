// TranslationPanel.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2F3C32;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 700px;
  z-index: 999;
`;

const PanelHeader = styled.div`
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: bold;
`;

const WordBlock = styled.div`
  margin-bottom: 8px;
`;

const SentenceBlock = styled.div`
  margin: 12px 0;
  line-height: 1.4;
`;

const ToggleButton = styled.button`
  margin-top: 12px;
  background: none;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
`;

const CloseButton = styled.button`
  float: right;
  background: none;
  color: #fff;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

function TranslationPanel({ data, onClose }) {
  const { word, wordTranslation, originalSentence, sentenceTranslation } = data;
  const [showFullSentences, setShowFullSentences] = useState(false);

  const handleToggle = () => {
    setShowFullSentences((prev) => !prev);
  };

  return (
    <PanelContainer>
      <CloseButton onClick={onClose}>✕</CloseButton>
      
      {/* Word + Word Translation */}
      <WordBlock>
        <PanelHeader>{word}</PanelHeader>
        <div style={{ fontStyle: 'italic', color: '#f8f8f8' }}>
          {wordTranslation}
        </div>
      </WordBlock>

      {/* Button to toggle full-sentence display */}
      <ToggleButton onClick={handleToggle}>
        {showFullSentences ? 'Hide Sentence' : 'Show Sentence'}
      </ToggleButton>

      {/* Conditionally show entire original & translated sentences */}
      {showFullSentences && (
        <>
          <SentenceBlock>
            <strong>Original</strong>
            <br />
            {originalSentence}
          </SentenceBlock>
          <SentenceBlock>
            <strong>Translated</strong>
            <br />
            {sentenceTranslation}
          </SentenceBlock>
        </>
      )}
    </PanelContainer>
  );
}

export default TranslationPanel;
