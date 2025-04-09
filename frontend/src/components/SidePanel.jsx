import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAudioAPI } from '../hooks/useAudioAPI';
import { STT_LANGUAGE_CODES, TTS_LANGUAGE_CODES, TTS_VOICE_IDS } from '../lib/lang_codes';
import RecordButton from './RecordButton';
import { FaPlay } from "react-icons/fa";
import { usePlatform } from '../context/PlatformContext';
import {
    SidePanelContainer,
    TabContainer,
    Tab,
    ContentSection,
    ExplanationText,
    TagsContainer,
    Tag,
    ItalicInfoText,
    ButtonGroup,
    ShareButton,
    ReportButton,
    InputContainer,
    LearnContentContainer,
    Label,
    GoalSelect,
    SetGoalButton,
    QuestionContainer,
    QuestionHeader,
    QuestionText,
    QuestionInput,
    CEFRTag,
    CheckAnswersButton,
    AudioControlsContainer,
    PlayButton,
    UserAnswerDisplay,
    ToggleIcon,
    FeatureToggleContainer,
    FeatureToggleButton
} from '../styles/ReadPageStyles';

import LoadingSpinner from './LoadingSpinner';
import { getCEFRColor, getCEFRTextColor } from '../lib/cefr';

import checkIcon from '../assets/icons/check.png';
import closeIcon from '../assets/icons/close.png';

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
    onIncrementProgress,
    useNaturalPronunciation,
    setUseNaturalPronunciation,
    useAudiobookMode,
    setUseAudiobookMode
}) => {
    const { isTeacher, isStudent } = usePlatform();
    const [activeTab, setActiveTab] = useState('info');
    const [selectedGoal, setSelectedGoal] = useState(GOAL_OPTIONS.RECOMMENDED.value);
    const [checkingAnswers, setCheckingAnswers] = useState(false);
    const { showNotification } = useNotification();
    const [passedQuestions, setPassedQuestions] = useState(0);
    const { stt, tts } = useAudioAPI();
    const [loadingAudio, setLoadingAudio] = useState([]);
    const [playingQuestion, setPlayingQuestion] = useState(null);
    
    const [usePremiumSpeechToText, setUsePremiumSpeechToText] = useState(false);

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
                language_code: languageCode,
                premium: usePremiumSpeechToText
            });
            
            if (response.error) {
                if (response.error.code === 'NO_TRANSCRIPT') {
                    showNotification('No speech detected in target language. Please try again.', 'error');
                } else if (response.error.code === 'USAGE_LIMIT_REACHED') {
                    if (isTeacher || isStudent) {
                        showNotification('Premium feature usage limit reached. Upgrade to teacher premium for unlimited usage!', 'error');
                      } else {
                        showNotification('Premium feature usage limit reached. Upgrade to premium for unlimited usage!', 'error');
                      }
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

    const handlePlayQuestion = async (index) => {
        try {
            setPlayingQuestion(index);
            const question = questions[index];
            const langCode = TTS_LANGUAGE_CODES[contentData.tags[0]];
            
            if (!langCode) {
                showNotification('Language not supported for text-to-speech', 'error');
                setPlayingQuestion(null);
                return;
            }
            
            const { data: audioContent, error } = await tts({ 
                language_code: langCode, 
                text: question.question, 
                voice_name: TTS_VOICE_IDS[langCode],
                natural: useNaturalPronunciation
            });
            
            if (error && error.code === 'USAGE_LIMIT_REACHED') {
                if (isTeacher || isStudent) {
                    showNotification('Premium feature usage limit reached. Upgrade to teacher premium for unlimited usage!', 'error');
                } else {
                    showNotification('Premium feature usage limit reached. Upgrade to premium for unlimited usage!', 'error');
                }
            setPlayingQuestion(null);
                return;
            }
            
            const audio = new Audio(`data:audio/mp3;base64,${audioContent.audio_content}`);
            audio.onended = () => setPlayingQuestion(null);
            await audio.play();
        } catch (error) {
            console.error('TTS failed:', error);
            if (error.code === 'USAGE_LIMIT_REACHED') {
                if (isTeacher || isStudent) {
                    showNotification('Premium feature usage limit reached. Upgrade to teacher premium for unlimited usage!', 'error');
                } else {
                    showNotification('Premium feature usage limit reached. Upgrade to premium for unlimited usage!', 'error');
                }
            } else {
                showNotification('Failed to play question. Please try again.', 'error');
            }
            setPlayingQuestion(null);
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
                    
                    <div className="flex flex-col gap-2 rounded-lg px-0 py-0 w-[80%]">
                        <p className="mt-0 mb-0 text-base font-primary text-[#666]">Click to enable or disable:</p>
                        <FeatureToggleButton 
                            $active={useNaturalPronunciation}
                            onClick={() => setUseNaturalPronunciation(!useNaturalPronunciation)}
                        >
                        <span>Natural Pronunciation</span>
                        {useNaturalPronunciation && <ToggleIcon 
                            src={checkIcon} 
                            alt={"Enabled"}
                        />}
                        </FeatureToggleButton>
                        <FeatureToggleButton 
                            $active={useAudiobookMode}
                            onClick={() => setUseAudiobookMode(!useAudiobookMode)}
                        >
                        <span>Audiobook Mode</span>
                        {useAudiobookMode && <ToggleIcon 
                            src={checkIcon} 
                            alt={"Enabled"}
                        />}
                        </FeatureToggleButton>
                    </div>

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
            <Label htmlFor="goal-select">Click to enable or disable:</Label>
            <FeatureToggleContainer>
                <FeatureToggleButton 
                    $active={useNaturalPronunciation}
                    onClick={() => setUseNaturalPronunciation(!useNaturalPronunciation)}
                >
                    <span>Natural Pronunciation</span>
                    {useNaturalPronunciation && <ToggleIcon 
                        src={checkIcon} 
                        alt={"Enabled"}
                    />}
                </FeatureToggleButton>
                
                <FeatureToggleButton 
                    $active={usePremiumSpeechToText}
                    onClick={() => setUsePremiumSpeechToText(!usePremiumSpeechToText)}
                >
                    <span>Premium Speech Recognition</span>
                    {usePremiumSpeechToText && <ToggleIcon 
                        src={checkIcon} 
                        alt={"Enabled"}
                    />}
                </FeatureToggleButton>
            </FeatureToggleContainer>

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
                {loadingQuestions ? 'Loading...' : 'Start!'}
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
                        {q.mode === 'text' ? (
                            <>
                                <QuestionInput
                                    value={q.answer}
                                    onChange={(e) => onAnswerChange(index, e.target.value)}
                                    $isVocab={q.type === 'vocab'}
                                    placeholder={q.type === 'vocab' ? 'Explain the word...' : 'Write your answer...'}
                                    $evaluated={q.evaluated}
                                    $passed={q.passed}
                                />
                            </>
                        ) : (
                            <>
                                <AudioControlsContainer>
                                    <PlayButton 
                                        onClick={() => handlePlayQuestion(index)}
                                        disabled={playingQuestion === index}
                                    >
                                        <FaPlay size={18} />
                                    </PlayButton>
                                    <RecordButton 
                                        onRecordingComplete={(audio) => handleRecordingComplete(audio, index)}
                                        onError={showNotification}
                                        id={index}
                                        loading={loadingAudio.includes(index)}
                                    />
                                </AudioControlsContainer>
                                <UserAnswerDisplay
                                    $evaluated={q.evaluated}
                                    $passed={q.passed}
                                >
                                    {q.answer || 'Your spoken answer will appear here...'}
                                </UserAnswerDisplay>
                            </>
                        )}
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