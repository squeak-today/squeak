import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BasicPage from '../components/BasicPage';
import StoryReader from '../components/StoryReader';
import { useNotification } from '../context/NotificationContext';
import { ReadPageLayout, ReaderPanel, BackButton } from '../styles/ReadPageStyles';
import SidePanel from '../components/SidePanel';
import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import TranslationPanel from '../components/TranslationPanel';

import { LANGUAGE_CODES_REVERSE } from '../lib/lang_codes';

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
    const [initialPages, setInitialPages] = useState(null);

    const apiBase = process.env.REACT_APP_API_BASE;

    const fetchTranslation = async (content, source) => {
		let url = `${apiBase}translate`;
		let translation = "";
		const data = {
			sentence: content,
			source: source,
			target: 'en'
		};
		const { data: { session } } = await supabase.auth.getSession();
		const jwt = session?.access_token;
		await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${jwt}`
			},
			body: JSON.stringify(data)
		}).then(response => response.json())
		.then(result => {
			console.log('Successful content translation!');
			translation = result["sentence"].toString();
		})
		.catch(error => {
			console.error('ERROR: ', error);
			showNotification("Couldn't find the translation. Please try again or come back later!", 'error');
		})
		return translation;
	};

    useEffect(() => {
        const fetchContent = async () => {
            // tentative:
            // if the type is Story, then we should be pulling a specific page.
            // additionally, we should retain cache for the next 3 pages and the previous 2 (if applicable).
            // this minimizes latency. We store them as MDX components ready for use, as compilation takes a hot minute.

            setIsLoading(true);
            const url = `${apiBase}content?type=${type}&id=${id}`;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const jwt = session?.access_token;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }

                const data = await response.json();
                
                setContentData({
                    id: id,
                    type: data.content_type,
                    title: data.title,
                    preview: data.preview_text,
                    tags: [data.language, data.topic],
                    difficulty: data.cefr_level,
                    date_created: data.date_created,
                    content: data.content,
                });
                setSourceLanguage(LANGUAGE_CODES_REVERSE[data.language]);
            } catch (error) {
                console.error('Error fetching content:', error);
                showNotification('Failed to load content. Please try again later.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id]);

    const handleWordClick = async (e, word, sourceLang, sentence) => {
        try {
            const translation = await fetchTranslation(word, sourceLang);
            
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
        const translation = await fetchTranslation(tooltip.originalSentence, sourceLanguage);
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
                const response = await fetch(`${apiBase}content-question`, {
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

            const results = await Promise.all(questions.map(async (q) => {
                const response = await fetch(`${apiBase}evaluate-qna`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        cefr: q.cefrLevel,
                        content: contentData.content,
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

    const handleNeedPages = async (currentPage) => {
        const DUMMY_PAGES = {
            0: "# Chapter 1\n\nThis is the first page of our story. The sun was rising over the mountains, casting long shadows across the valley.",
            1: "# Chapter 2\n\nOn the second page, our hero begins their journey. The path ahead seemed uncertain, but they pressed on.",
            2: "# Chapter 3\n\nThe third page reveals new challenges. Thunder rolled in the distance as dark clouds gathered overhead.",
            3: "# Chapter 4\n\nOn page four, the plot thickens. The ancient ruins stood silent, holding secrets of the past.",
            4: "# Chapter 5\n\nThe fifth page brings revelations. Everything they thought they knew was about to change.",
            5: "# Final Chapter\n\nOn the final page, all is revealed. The end of one story is just the beginning of another."
        };
        
        // Simulate API delay between 200-800ms
        await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));
        
        const totalPages = 6;
        const pagesToReturn = new Map();
        
        // return current page and next 3 pages if they exist
        for (let i = currentPage; i < currentPage + 4 && i < totalPages; i++) {
            if (DUMMY_PAGES[i]) {
                pagesToReturn.set(i, DUMMY_PAGES[i]);
            }
        }
        
        // include up to 2 previous pages if they exist
        for (let i = currentPage - 1; i >= currentPage - 2 && i >= 0; i--) {
            if (DUMMY_PAGES[i]) {
                pagesToReturn.set(i, DUMMY_PAGES[i]);
            }
        }

        return pagesToReturn;
    };

    useEffect(() => {
        const loadInitialPages = async () => {
            const pages = await handleNeedPages(0);
            setInitialPages(pages);
        };
        loadInitialPages();
    }, []);

    return (
        <BasicPage showLogout onLogout={handleLogout}>
            <div style={{ width: '95%', alignSelf: 'center' }}>
                <BackButton onClick={() => navigate('/learn')}>
                    ← Back to Browse
                </BackButton>
                <ReadPageLayout>
                    <ReaderPanel onScroll={handleReaderScroll}>
                        <StoryReader 
                            content={false ? contentData.content : initialPages}
                            paged={true}
                            onNeedPages={handleNeedPages}
                            handleWordClick={handleWordClick}
                            sourceLanguage={sourceLanguage}
                            isLoading={isLoading || !initialPages}
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
                        />
                    )}
                </ReadPageLayout>
            </div>
        </BasicPage>
    );
}

export default Read; 