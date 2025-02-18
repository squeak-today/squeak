// TranslationPanel.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import audioIcon from '../assets/audio.png';

const slideUpAnimation = keyframes`
  0% {
    transform: translateY(25%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDownAnimation = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const Panel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #2F3C32;
  color: #fff;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  max-width: 700px;
  margin: 0 auto;
  z-index: 999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  animation: ${props => props.$show ? slideUpAnimation : slideDownAnimation} 0.15s ease-in-out forwards;
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
  display: flex;
  align-items: center;
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

const TranslatedSentence = styled.div`
  font-style: italic;
  opacity: 0.9;
`;

const SpeakerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`;

const AudioIcon = styled.img`
  width: 20px;
  height: 20px;
  filter: invert(1); // Makes black icon white
`;

const SentenceHeader = styled.div`
  display: flex;
  align-items: center;
`;

function TranslationPanel({ data, onClose, handleSentenceToggle, onPlayTTS, isPlayingTTS }) {
  const [isClosing, setIsClosing] = useState(false);
  const [showSentences, setShowSentences] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  const handleToggle = async () => {
    await handleSentenceToggle();
    setShowSentences(prev => !prev);
  };

  useEffect(() => {
    setShowSentences(false);
  }, [data.word]);

  return (
    <Panel $show={!isClosing}>
      <Header>
        <Word>
          {data.word}
          <SpeakerButton 
            onClick={() => onPlayTTS(data.word)}
            disabled={isPlayingTTS}
          >
            <AudioIcon src={audioIcon} alt="" />
          </SpeakerButton>
        </Word>
        <CloseButton onClick={handleClose}>✕</CloseButton>
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
            <SentenceHeader>
              <strong>Translated</strong>
              <SpeakerButton 
                onClick={() => onPlayTTS(data.originalSentence)}
                disabled={isPlayingTTS}
              >
                <AudioIcon src={audioIcon} alt="" />
              </SpeakerButton>
            </SentenceHeader>
            <TranslatedSentence>{data.sentenceTranslation}</TranslatedSentence>
          </Sentence>
        </>
      )}
    </Panel>
  );
}

export default TranslationPanel;
