import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BasicPage from '../components/BasicPage';
import StoryReader from '../components/StoryReader';
import { useNotification } from '../context/NotificationContext';
import { ReadPageLayout, ReaderPanel, BackButton } from '../styles/ReadPageStyles';
import SidePanel from '../components/SidePanel';
import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import TranslationPanel from '../components/TranslationPanel';
import { useAudioAPI } from '../services/hooks/useAudioAPI';

import { LANGUAGE_CODES_REVERSE, TTS_LANGUAGE_CODES, TTS_VOICE_IDS } from '../lib/lang_codes';

const DEFAULT_CONTENT = {
    id: '',
    type: '',
    title: '',
    preview: '',
    tags: [],
    difficulty: '',
    date_created: '',
    content: '',
};

function Read() {
    const { type, id } = useParams();
    const { state } = useLocation();

    const navigate = useNavigate();
    const { showNotification } = useNotification();
    
    const [contentData, setContentData] = useState(DEFAULT_CONTENT);
    const [sourceLanguage, setSourceLanguage] = useState('en');
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [tooltip, setTooltip] = useState({
        show: false,
        word: '',
        wordTranslation: '',
        originalSentence: '',
        sentenceTranslation: '',
        top: 0,
        bottom: 0,
        left: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    
    // For Story
    const [pagedData, setPagedData] = useState(new Map());
    const [totalPages, setTotalPages] = useState(null);

    const apiBase = process.env.REACT_APP_API_BASE;

    const { translate, tts } = useAudioAPI();
    const [isPlayingTTS, setIsPlayingTTS] = useState(false);

    useEffect(() => {
        const loadInitialMetadata = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const jwt = session?.access_token;
                let url = '';
                if (type === 'Story') {
                    url = `${apiBase}story?id=${id}&page=0`;
                } else {
                    url = `${apiBase}news?id=${id}`;
                }
                const metadataResponse = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });
                const metadata = await metadataResponse.json();
                if (metadata.error === 'Content not accepted in classroom') {
                    throw new Error('Content not accepted in your classroom');
                }
                if (!metadataResponse.ok) {
                    throw new Error('Failed to fetch content');
                }
                
                setContentData({
                    id: id,
                    type: metadata.content_type,
                    title: metadata.title,
                    preview: metadata.preview_text,
                    tags: [metadata.language, metadata.topic],
                    difficulty: metadata.cefr_level,
                    date_created: metadata.date_created,
                    content: metadata.content,
                     // eslint-disable-next-line no-dupe-keys
                    type: type, 
                });
                setSourceLanguage(LANGUAGE_CODES_REVERSE[metadata.language]);
                if (type === 'Story' && metadata.pages) {
                    setTotalPages(metadata.pages);
                    setPagedData(new Map([[0, metadata.content]]));
                    fetchStoryPages(0, metadata.pages);
                }
            } catch (error) {
                console.error('Error loading metadata:', error);
                showNotification('Failed to load metadata: ' + error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        setIsLoading(true);
        loadInitialMetadata();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id]);

    const handleWordClick = async (e, word, sourceLang, sentence) => {
        try {
            const translationData = await translate(word, sourceLang);
            const translation = translationData.sentence;
            if (translation) {
                setTooltip({
                    show: true,
                    word: word,
                    wordTranslation: translation,
                    originalSentence: sentence,
                    sentenceTranslation: '',
                });
            }
        } catch (error) {
            console.error('Error getting word definition:', error);
            showNotification('Failed to get translation', 'error');
        }
    };

    const handleSentenceToggle = async () => {
        const translationData = await translate(tooltip.originalSentence, sourceLanguage);
        const translation = translationData.sentence;
        setTooltip(prev => ({ ...prev, sentenceTranslation: translation }));
    };

    const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			navigate('/');
		} catch (error) {
			console.error('Error signing out:', error);
			showNotification('Error signing out. Please try again.');
		}
	};

    const handleGetGoalQuestions = async (goalType, isBeginnerLevel) => {
        const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const questions = [];
        const vocabQuestions = [];
        const cefrIndex = CEFR_LEVELS.indexOf(contentData.difficulty);
        let qv;
        
        const fetchQuestion = async (cefrLevel, qType) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const jwt = session?.access_token;
                const response = await fetch(`${apiBase}qna`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        content_type: contentData.type,
                        id: contentData.id,
                        cefr_level: cefrLevel,
                        question_type: qType
                    })
                });
                const data = await response.json();
                return { 
                    question: data.question,
                    cefrLevel,
                    type: qType,
                    answer: ''
                };
            } catch (error) {
                console.error('Error fetching question:', error);
                return null;
            }
        };

        setLoadingQuestions(true);
        try {
            switch (goalType) {
                case '1': // Quick
                    qv = await fetchQuestion(contentData.difficulty, 'vocab');
                    if (qv) questions.push(qv);
                    break;

                case '3': // Recommended
                    if (isBeginnerLevel) {
                        // Get vocab question first
                        let q = await fetchQuestion(contentData.difficulty, 'vocab');
                        if (q) vocabQuestions.push(q);
                        
                        // Then get understanding question
                        q = await fetchQuestion(contentData.difficulty, 'understanding');
                        if (q) questions.push(q);
                    } else {
                        // Get vocab question first
                        qv = await fetchQuestion(contentData.difficulty, 'vocab');
                        if (qv) vocabQuestions.push(qv);
                        
                        // Then get understanding questions
                        const q1 = await fetchQuestion(contentData.difficulty, 'understanding');
                        const q2 = await fetchQuestion(CEFR_LEVELS[cefrIndex - 1], 'understanding');
                        if (q1) questions.push(q1);
                        if (q2) questions.push(q2);
                    }
                    break;

                case '8': // Strong
                    // Get vocab question first
                    qv = await fetchQuestion(contentData.difficulty, 'vocab');
                    if (qv) vocabQuestions.push(qv);
                    
                    // Then get understanding questions
                    for (let i = 1; i <= cefrIndex; i++) {
                        const q = await fetchQuestion(CEFR_LEVELS[i], 'understanding');
                        if (q) questions.push(q);
                    }
                    break;
                    
                default:
                    break;
            }
            
            setQuestions([...vocabQuestions, ...questions]);
        } catch (error) {
            console.error('Error setting goal:', error);
            showNotification('Failed to load questions. Please try again.', 'error');
        }
        setLoadingQuestions(false);
    };

    const handleAnswerChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            answer: value,
            evaluated: false
        };
        setQuestions(updatedQuestions);
    };

    const handleCheckAnswers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const jwt = session?.access_token;

            let contextInfo = '';
            if (type === 'Story') {
                // stories are too long, so we query context.txt
                const response = await fetch(`${apiBase}story/context?id=${id}`, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });
                const data = await response.json();
                contextInfo = data.context;
            }

            const results = await Promise.all(questions.map(async (q) => {
                const response = await fetch(`${apiBase}qna/evaluate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        cefr: q.cefrLevel,
                        content: (type === 'Story') ? contextInfo : contentData.content,
                        question: q.question,
                        answer: q.answer
                    })
                });
                const data = await response.json();
                return data;
            }));

            const updatedQuestions = questions.map((q, i) => ({
                ...q,
                evaluated: true,
                passed: results[i].evaluation === 'PASS',
                explanation: results[i].explanation
            }));

            const passCount = updatedQuestions.filter(q => q.passed === true).length;

            setQuestions(updatedQuestions);
            showNotification(`You got ${passCount} out of ${questions.length} correct!`, 'success');
            
            return passCount;
        } catch (error) {
            console.error('Error checking answers:', error);
            showNotification('Failed to check answers. Please try again.', 'error');
            return 0;
        }
    };

    const handleIncrementProgress = async (newlyPassedCount) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const jwt = session?.access_token;

            await fetch(`${apiBase}progress/increment?amount=${newlyPassedCount}`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
        } catch (error) {
            console.error('Error incrementing progress:', error);
            showNotification('Failed to increment progress. Please try again.', 'error');
        }
    };

    const handleReaderScroll = () => { setTooltip(prev => ({ ...prev, show: false })); };

    // fetches story pages of current page and three pages before and after
    // and consequently caches them, and deletes ones outside of that range
    const fetchStoryPages = async (currentPage, knownTotalPages) => {
        const pagesToFetch = [];
        for (let i = currentPage; i < currentPage + 3 && i < knownTotalPages; i++) {
            pagesToFetch.push(i);
        }
        for (let i = currentPage - 1; i >= currentPage - 2 && i >= 0; i--) {
            pagesToFetch.push(i);
        }

        const newPagedData = new Map(pagedData);
        const newPagesToFetch = pagesToFetch.filter(pageNum => !newPagedData.has(pageNum));

        Array.from(newPagedData.keys()).forEach((pageNum) => {
            if (!pagesToFetch.includes(pageNum)) {
                newPagedData.delete(pageNum);
            }
        })
        
        const { data: { session } } = await supabase.auth.getSession();
        const jwt = session?.access_token;

        const fetchPage = async (pageNum) => {
            try {
                const response = await fetch(`${apiBase}story?id=${id}&page=${pageNum}`, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });
                if (!response.ok) return null;
                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Error fetching page ${pageNum}:`, error);
                return null;
            }
        };

        const promises = [];
        
        for (let i = 0; i < newPagesToFetch.length; i++) {
            promises.push(
                fetchPage(newPagesToFetch[i]).then(data => {
                    if (data?.content) newPagedData.set(newPagesToFetch[i], data.content);
                })
            );
        }

        await Promise.all(promises);
        
        setPagedData(new Map(newPagedData));
        return newPagedData;
    };

    const handlePlayTTS = async (text) => {
        try {
            setIsPlayingTTS(true);
            const langCode = TTS_LANGUAGE_CODES[contentData.tags[0]];
            const audioContent = await tts(langCode, text, TTS_VOICE_IDS[langCode]);
            const audio = new Audio(`data:audio/mp3;base64,${audioContent.audio_content}`);
            await audio.play();
        } catch (error) {
            console.error('Error playing TTS:', error);
            showNotification('Failed to play audio', 'error');
        } finally {
            setIsPlayingTTS(false);
        }
    };

    return (
        <BasicPage showLogout onLogout={handleLogout}>
            <div style={{ width: '95%', alignSelf: 'center' }}>
                <BackButton onClick={() => navigate(state?.backTo || '/learn')}>
                    ← Back to Browse
                </BackButton>
                <ReadPageLayout>
                    <ReaderPanel onScroll={handleReaderScroll}>
                        <StoryReader 
                            content={type === 'Story' ? pagedData : contentData.content}
                            paged={type === 'Story' ? totalPages : 0}
                            onNeedPages={fetchStoryPages}
                            handleWordClick={handleWordClick}
                            sourceLanguage={sourceLanguage}
                            isLoading={isLoading || (!pagedData && type === 'Story')}
                        />
                    </ReaderPanel>
                    <SidePanel 
                        contentData={contentData}
                        questions={questions}
                        onGetQuestions={handleGetGoalQuestions}
                        onAnswerChange={handleAnswerChange}
                        loadingQuestions={loadingQuestions}
                        onCheckAnswers={handleCheckAnswers}
                        isLoading={isLoading}
                        onIncrementProgress={handleIncrementProgress}
                    />
                    {tooltip.show && (
                        <TranslationPanel
                            data={{
                                word: tooltip.word,
                                wordTranslation: tooltip.wordTranslation,
                                originalSentence: tooltip.originalSentence,
                                sentenceTranslation: tooltip.sentenceTranslation
                            }}
                            onClose={() => setTooltip(prev => ({ ...prev, show: false }))}
                            handleSentenceToggle={handleSentenceToggle}
                            onPlayTTS={handlePlayTTS}
                            isPlayingTTS={isPlayingTTS}
                        />
                    )}
                </ReadPageLayout>
            </div>
        </BasicPage>
    );
}

export default Read; 