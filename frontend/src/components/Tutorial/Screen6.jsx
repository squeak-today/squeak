import React, { useState } from 'react'; 
import StoryReader from '../StoryReader';
import NextButton from './NextButton';
import TranslationPanel from '../TranslationPanel';
import styled from 'styled-components';
import { useNotification } from '../../context/NotificationContext';
import {
  QuestionContainer,
  QuestionHeader,
  QuestionText,
  QuestionInput,
  CheckAnswersButton,
  ExplanationText,
} from '../../styles/ReadPageStyles';
import { useAudioAPI } from '../../hooks/useAudioAPI';
import { TTS_LANGUAGE_CODES, TTS_VOICE_IDS } from '../../lib/lang_codes';

// Headings as paragraphs with desired font sizes
const MainHeading = styled.p`
  font-size: 32px;
  margin: 0 0 10px;
  text-align: center;
  font-family: 'Lora', serif;
`;

const SubHeading = styled.p`
  font-size: 20px;
  margin: 0 0 30px;
  text-align: center;
  color: #555;
  font-family: 'Lora', serif;
`;

// A wrapper that centers content (StoryReader and the question section)
const ContentWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

// Custom question container, set to be thinner and left-justified (matching StoryReader's text alignment)
const CustomQuestionContainer = styled(QuestionContainer)`
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

// Submit Answer button styled to be as wide as its text plus 20px padding on both sides.
// Left aligned on desktop and centered on mobile.
const CustomCheckAnswersButton = styled(CheckAnswersButton)`
  padding: 10px 20px;
  width: auto;
  display: inline-block;
  align-self: flex-start;
  @media (max-width: 768px) {
    align-self: center;
  }
`;

// Feedback text left-aligned.
const CustomExplanationText = styled(ExplanationText)`
  text-align: left;
`;

// Overall page container.
const Container = styled.div`
  position: relative;
  width: 100%;
  min-height: calc(100vh - 80px - 60px);
  padding: 40px;
  box-sizing: border-box;
  font-family: 'Lora', serif;
`;

// Translation notification styled to only be as wide as its content plus 20px padding on each side, and centered.
const TranslationNotification = styled.div`
  display: table;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin: 0 auto 20px auto;
  font-family: 'Lora', serif;
`;

// Continue button wrapper in document flow (not absolute) so that it sits below the question container.
// Right aligned on desktop, centered on mobile.
const ContinueButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: right;
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const Screen6 = ({ onNext, sourceLanguage = "fr" }) => {
  const { showNotification } = useNotification();
  const [hasTranslated, setHasTranslated] = useState(false);
  const [tooltip, setTooltip] = useState({
    show: false,
    word: '',
    wordTranslation: '',
    originalSentence: '',
    sentenceTranslation: '',
  });
  const { translate, tts } = useAudioAPI();

  // Normalize sourceLanguage.
  if(sourceLanguage.toLowerCase().trim() === "french"){
    sourceLanguage = "fr";
  } else {
    sourceLanguage = "es";
  }

  // Evaluation question state.
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationError] = useState(null);

  const mainHeadingText = "Let's get you started";
  const subHeadingText =
    sourceLanguage === "es"
      ? "Here's a sample story in Spanish to show you how this works:"
      : "Here's a sample story in French to show you how this works:"; 

  const sampleContent =
    sourceLanguage === "es"
      ? "## Bienvenido a Squeak \n Bienvenido a Squeak, esperamos que disfrutes y tengas un gran momento."
      : "## Bienvenue sur Squeak \n Bienvenue sur Squeak, nous espérons que vous passerez un excellent moment.";

  const handleWordClick = async (e, word, sourceLang, sentence) => {
    try {
      const translationData = await translate({ sentence: word, source: sourceLang, target: "en" });
      const translation = translationData.sentence;
      if (translation) {
        setTooltip({
          show: true,
          word,
          wordTranslation: translation,
          originalSentence: sentence,
          sentenceTranslation: '',
        });
        setHasTranslated(true);
      }
    } catch (error) {
      console.error('Error getting word translation:', error);
    }
  };

  const handleSentenceToggle = async () => {
    try {
      const translationData = await translate({ sentence: tooltip.originalSentence, source: sourceLanguage, target: "en" });
      const translation = translationData.sentence;
      setTooltip(prev => ({ ...prev, sentenceTranslation: translation }));
    } catch (error) {
      console.error('Error toggling sentence translation:', error);
    }
  };

  const handleEvaluateAnswer = async () => {
    // Define acceptable English synonyms for "welcome".
    const acceptableSynonyms = ["welcome", "greetings", "salutations"];
    
    const userAnswer = questionAnswer.trim().toLowerCase();
    
    // Check if the answer contains one of the acceptable synonyms.
    const isPass = acceptableSynonyms.some(syn => userAnswer.includes(syn));
    
    const result = {
      evaluation: isPass ? "PASS" : "FAIL",
      explanation: isPass
        ? "Correct!"
        : "Your answer doesn't match any accepted synonym for 'welcome' in English.",
    };
  
    setEvaluationResult(result);
  
    if (!isPass) {
      showNotification("Your answer doesn't seem to be correct. Please try again.", "error");
    }
  };

  const handlePlayTTS = async (text) => {
    try {
      const langCode = TTS_LANGUAGE_CODES[sourceLanguage];
      const audioContent = await tts({ language_code: langCode, text, voice_name: TTS_VOICE_IDS[langCode] });
      const audio = new Audio(`data:audio/mp3;base64,${audioContent.audio_content}`);
      await audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      showNotification('Failed to play audio', 'error');
    }
  };

  return (
    <>
      <Container>
        <MainHeading>{mainHeadingText}</MainHeading>
        <SubHeading>{subHeadingText}</SubHeading>

        {/* Translation notification: only as wide as its content + padding, centered */}
        {!hasTranslated && (
          <TranslationNotification>
            <span>❗</span>
            <span style={{ marginLeft: '10px' }}>Click any word to translate</span>
          </TranslationNotification>
        )}

        <ContentWrapper>
          <StoryReader 
            content={sampleContent}
            paged={0}
            onNeedPages={null}
            handleWordClick={handleWordClick}
            sourceLanguage={sourceLanguage}
            isLoading={false}
          />

          <CustomQuestionContainer>
            <QuestionHeader>
              <QuestionText>
                What does "{sourceLanguage === "es" ? "Bienvenido" : "Bienvenue"}" mean?
              </QuestionText>
            </QuestionHeader>
            <QuestionInput
              value={questionAnswer}
              onChange={(e) => setQuestionAnswer(e.target.value)}
              placeholder="Type your answer here"
            />
            <CustomCheckAnswersButton onClick={handleEvaluateAnswer}>
              Submit Answer
            </CustomCheckAnswersButton>
            {evaluationError && (
              <CustomExplanationText $passed={false}>
                {evaluationError}
              </CustomExplanationText>
            )}
            {evaluationResult && (
              <CustomExplanationText $passed={evaluationResult.evaluation === "PASS"}>
                {evaluationResult.evaluation === "PASS" ? "Correct!" : "Incorrect. Please try again."}
                {evaluationResult.explanation && ` ${evaluationResult.explanation}`}
              </CustomExplanationText>
            )}
          </CustomQuestionContainer>

          {/* Continue button rendered in the natural document flow */}
          <ContinueButtonWrapper>
            <NextButton
              onNext={() => {
                if (!hasTranslated) {
                  showNotification("Please translate at least one word by clicking on it before continuing.", "error");
                  return;
                }
                onNext();
              }}
              disabled={!hasTranslated}
            />
          </ContinueButtonWrapper>
        </ContentWrapper>

        {tooltip.show && (
          <TranslationPanel
            data={{
              word: tooltip.word,
              wordTranslation: tooltip.wordTranslation,
              originalSentence: tooltip.originalSentence,
              sentenceTranslation: tooltip.sentenceTranslation,
            }}
            onClose={() => setTooltip(prev => ({ ...prev, show: false }))}
            handleSentenceToggle={handleSentenceToggle}
            onPlayTTS={handlePlayTTS}
            isPlayingTTS={false}
          />
        )}
      </Container>
    </>
  );
};

export default Screen6;
