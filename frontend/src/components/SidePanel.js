import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
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
                    <QuestionInput
                        value={q.answer}
                        onChange={(e) => onAnswerChange(index, e.target.value)}
                        $isVocab={q.type === 'vocab'}
                        placeholder={q.type === 'vocab' ? 'Enter translation...' : 'Write your answer...'}
                        $evaluated={q.evaluated}
                        $passed={q.passed}
                    />
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