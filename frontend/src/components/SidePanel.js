import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAudioAPI } from '../hooks/useAudioAPI';
import { STT_LANGUAGE_CODES } from '../lib/lang_codes';
import RecordButton from './RecordButton';
import {
    SidePanelContainer,
    TabContainer,
    Tab,
    ContentSection,
    ExplanationText,
} from '../styles/ReadPageStyles';

import {
    TagsContainer,
    Tag,
    ItalicInfoText,
    ButtonGroup,
    ShareButton,
    ReportButton,
    InputContainer
} from '../styles/ReadPageStyles';

import {
    LearnContentContainer,
    Label,
    GoalSelect,
    SetGoalButton,
    QuestionContainer,
    QuestionHeader,
    QuestionText,
    QuestionInput,
    CEFRTag,
    CheckAnswersButton
} from '../styles/ReadPageStyles';

import LoadingSpinner from './LoadingSpinner';
import { getCEFRColor, getCEFRTextColor } from '../lib/cefr';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    
    const getOrdinal = (n) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).replace(/\d+/, day + getOrdinal(day)) + ".";
};

const GOAL_OPTIONS = {
    QUICK: { value: '1', label: 'Quick Study (30 seconds)' },
    RECOMMENDED: { value: '3', label: 'Standard Study (1-2 minutes)' },
    STRONG: { value: '8', label: 'Deep Study (5-10 minutes)' }
};

const SidePanel = ({ 
    contentData,
    questions, 
    onGetQuestions, 
    onAnswerChange,
    loadingQuestions,
    onCheckAnswers,
    isLoading,
    onIncrementProgress
}) => {
    const [activeTab, setActiveTab] = useState('info');
    const [selectedGoal, setSelectedGoal] = useState(GOAL_OPTIONS.RECOMMENDED.value);
    const [checkingAnswers, setCheckingAnswers] = useState(false);
    const { showNotification } = useNotification();
    const [passedQuestions, setPassedQuestions] = useState(0);
    const { stt } = useAudioAPI();
    const [loadingAudio, setLoadingAudio] = useState([]);

    const isBeginnerLevel = contentData.difficulty === 'A1' || contentData.difficulty === 'A2';

    useEffect(() => {
        setPassedQuestions(0);
    }, [contentData]);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            showNotification('Copied link to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy link', 'error');
        }
    };

    const handleSetGoal = () => {
        onGetQuestions(selectedGoal, isBeginnerLevel);
    };

    const handleCheckAnswers = async () => {
        // Check if all questions are answered
        const unanswered = questions.some(q => !q.answer.trim());
        if (unanswered) {
            showNotification('Try answering all questions before checking!', 'error');
            return;
        }

        setCheckingAnswers(true);
        const passCount = await onCheckAnswers();
        const newlyPassedCount = passCount - passedQuestions;
        if (newlyPassedCount > 0) {
            await onIncrementProgress(newlyPassedCount);
        }
        setPassedQuestions(passCount);
        setCheckingAnswers(false);
    };

    const handleRecordingComplete = async (base64Audio, index) => {
        try {
            setLoadingAudio(prev => [...prev, index]);
            
            const languageCode = STT_LANGUAGE_CODES[contentData.tags[0]];
            
            if (!languageCode) {
                showNotification('Language not supported for speech recognition', 'error');
                setLoadingAudio(prev => prev.filter(i => i !== index));
                return;
            }

            const response = await stt({
                audio_content: base64Audio,
                language_code: languageCode
            });
            
            if (response.error) {
                if (response.error.code === 'NO_TRANSCRIPT') {
                    showNotification('No speech detected in target language. Please try again.', 'error');
                } else {
                    console.error('Speech to text API error:', response.error);
                    showNotification(`Speech-to-text failed: ${response.error.error}`, 'error');

                }
                return;
            }
            
            if (response.data && response.data.transcript) {
                onAnswerChange(index, response.data.transcript);
            } else {
                showNotification('No speech detected. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Speech to text failed:', error);
            showNotification('Failed to convert speech to text. Please try again.', 'error');
        } finally {
            setLoadingAudio(prev => prev.filter(i => i !== index));
        }
    };

    const renderInfoTab = () => (
        <>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <ContentSection>
                        <TagsContainer>
                            <Tag type="cefr" color={getCEFRColor(contentData.difficulty)} style={{color: getCEFRTextColor(contentData.difficulty)}}>
                                {contentData.difficulty}
                            </Tag>
                            {contentData.tags.map((tag, index) => (
                                <Tag key={index}>{tag}</Tag>
                            ))}
                        </TagsContainer>

                        <ItalicInfoText>Written on {formatDate(contentData.date_created)}</ItalicInfoText>
                    </ContentSection>

                    <ContentSection>
                        <ButtonGroup>
                            <ShareButton onClick={handleShare}>
                                Share
                            </ShareButton>
                            <ReportButton onClick={() => window.open('/contact-support.html', '_blank')}>
                                Report
                            </ReportButton>
                        </ButtonGroup>
                    </ContentSection>
                </>
            )}
        </>
    );

    const renderLearnTab = () => (
        <LearnContentContainer>
            <Label htmlFor="goal-select">Choose a goal for this content:</Label>
            <GoalSelect 
                id="goal-select"
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
            >
                <option value={GOAL_OPTIONS.QUICK.value}>
                    {GOAL_OPTIONS.QUICK.label}
                </option>
                <option value={GOAL_OPTIONS.RECOMMENDED.value}>
                    {GOAL_OPTIONS.RECOMMENDED.label}
                </option>
                {!isBeginnerLevel && (
                    <option value={GOAL_OPTIONS.STRONG.value}>
                        {GOAL_OPTIONS.STRONG.label}
                    </option>
                )}
            </GoalSelect>
            <SetGoalButton 
                onClick={handleSetGoal}
                disabled={loadingQuestions}
            >
                {loadingQuestions ? 'Loading...' : 'Set Goal'}
            </SetGoalButton>

            {questions.map((q, index) => (
                <QuestionContainer key={index}>
                    <QuestionHeader>
                        <CEFRTag type="cefr" color={getCEFRColor(q.cefrLevel)} style={{color: getCEFRTextColor(q.cefrLevel)}}>
                            {q.cefrLevel}
                        </CEFRTag>
                        <QuestionText>{q.question}</QuestionText>
                    </QuestionHeader>
                    <InputContainer>
                        <QuestionInput
                            value={q.answer}
                            onChange={(e) => onAnswerChange(index, e.target.value)}
                            $isVocab={q.type === 'vocab'}
                            placeholder={q.type === 'vocab' ? 'Explain the word...' : 'Write your answer...'}
                            $evaluated={q.evaluated}
                            $passed={q.passed}
                        />
                        <RecordButton 
                            onRecordingComplete={handleRecordingComplete}
                            onError={showNotification}
                            id={index}
                            loading={loadingAudio.includes(index)}
                        />
                    </InputContainer>
                    {q.evaluated && q.explanation && (
                        <ExplanationText $passed={q.passed}>
                            {q.explanation}
                        </ExplanationText>
                    )}
                </QuestionContainer>
            ))}

            {questions.length > 0 && (
                <CheckAnswersButton 
                    onClick={handleCheckAnswers}
                    disabled={checkingAnswers}
                >
                    {checkingAnswers ? 'Checking...' : 'Check Answers'}
                </CheckAnswersButton>
            )}
        </LearnContentContainer>
    );

    return (
        <SidePanelContainer>
            <TabContainer>
                <Tab 
                    $active={activeTab === 'info'} 
                    onClick={() => setActiveTab('info')}
                >
                    Info
                </Tab>
                <Tab 
                    $active={activeTab === 'learn'} 
                    onClick={() => setActiveTab('learn')}
                >
                    Test Yourself
                </Tab>
            </TabContainer>

            {activeTab === 'info' ? renderInfoTab() : renderLearnTab()}
        </SidePanelContainer>
    );
};

export default SidePanel; 