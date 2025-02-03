import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BasicPage from '../components/BasicPage';
import StoryReader from '../components/StoryReader';
import { useNotification } from '../context/NotificationContext';
import { ReadPageLayout, ReaderPanel } from '../styles/ReadPageStyles';
import SidePanel from '../components/SidePanel';
import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '../components/StyledComponents';

import { LANGUAGE_CODES_REVERSE } from '../lib/lang_codes';

const DEFAULT_CONTENT = {
    id: '',
    type: '',
    title: '',
    preview: '',
    tags: [],
    difficulty: '',
    date_created: '',
    content: ''
};

function Read() {
    const { type, id } = useParams();

    const navigate = useNavigate();
    const { showNotification } = useNotification();
    
    const [contentData, setContentData] = useState(DEFAULT_CONTENT);
    const [textSections, setTextSections] = useState([]);
    const [sourceLanguage, setSourceLanguage] = useState('en');
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [tooltip, setTooltip] = useState({
        show: false,
        text: '',
        top: 0,
        left: 0
    });

    const apiBase = "https://api.squeak.today/";

    const fetchWordDefinition = async (word, source) => {
		let url = `${apiBase}translate`;
		let translation = "";
		const data = {
			sentence: word,
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
			console.log('Successful word translation!');
			translation = result["sentence"].toString();
		})
		.catch(error => {
			console.error('ERROR: ', error);
			showNotification("Couldn't find that word. Please try again or come back later!", 'error');
		})
		return translation;
	};

    useEffect(() => {
        const fetchContent = async () => {
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
                
                // Split content into sections
                const sections = data.content.match(/(?:\s*\S+){1,200}/g) || [];
                
                setTextSections(sections);
                setContentData({
                    id: id,
                    type: data.content_type,
                    title: data.title,
                    preview: data.preview_text,
                    tags: [data.language, data.topic],
                    difficulty: data.cefr_level,
                    date_created: data.date_created,
                    content: data.content
                });
                setSourceLanguage(LANGUAGE_CODES_REVERSE[data.language]);
            } catch (error) {
                console.error('Error fetching content:', error);
                showNotification('Failed to load content. Please try again later.', 'error');
            }
        };

        fetchContent();
    }, [type, id, showNotification]);

    const handleWordClick = async (e, word, sourceLang) => {
        try {
            // get position
            const rect = e.target.getBoundingClientRect();
            const top = rect.bottom;
            const left = rect.left;
            const translation = await fetchWordDefinition(word, sourceLang);
            
            if (translation) {
                setTooltip({
                    word: word,
                    show: true,
                    text: translation,
                    top,
                    left
                });
            }
        } catch (error) {
            console.error('Error getting word definition:', error);
            showNotification('Failed to get translation', 'error');
        }
    };

    // Add click outside handler to close tooltip
    const handleClickOutside = (e) => {
        if (!e.target.closest('.word')) {
            setTooltip(prev => ({ ...prev, show: false }));
        }
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
        const cefrIndex = CEFR_LEVELS.indexOf(contentData.difficulty);
        
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
                    const qv = await fetchQuestion(contentData.difficulty, 'vocab');
                    if (qv) questions.push(qv);
                    break;

                case '3': // Recommended
                    if (isBeginnerLevel) {
                        let q = await fetchQuestion(contentData.difficulty, 'vocab');
                        if (q) questions.push(q);
                        q = await fetchQuestion(contentData.difficulty, 'understanding');
                        if (q) questions.push(q);
                    } else {
                        const q1 = await fetchQuestion(contentData.difficulty, 'understanding');
                        const q2 = await fetchQuestion(CEFR_LEVELS[cefrIndex - 1], 'understanding');
                        if (q1) questions.push(q1);
                        if (q2) questions.push(q2);
                        const q = await fetchQuestion(contentData.difficulty, 'vocab');
                        if (q) questions.push(q);
                    }
                    break;

                case '8': // Strong
                    for (let i = 1; i <= cefrIndex; i++) {
                        const q = await fetchQuestion(CEFR_LEVELS[i], 'understanding');
                        if (q) questions.push(q);
                    }
                    const q = await fetchQuestion(contentData.difficulty, 'vocab');
                    if (q) questions.push(q);
                    break;
            }
            setQuestions(questions);
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
                return data.evaluation === 'PASS';
            }));

            const updatedQuestions = questions.map((q, i) => ({
                ...q,
                evaluated: true,
                passed: results[i]
            }));
            setQuestions(updatedQuestions);

            const passCount = results.filter(r => r).length;
            showNotification(`You got ${passCount} out of ${questions.length} correct!`, 'success');
            return true;
        } catch (error) {
            console.error('Error checking answers:', error);
            showNotification('Failed to check answers. Please try again.', 'error');
            return false;
        }
    };

    return (
        <BasicPage showLogout onLogout={handleLogout}>
            <ReadPageLayout onClick={handleClickOutside}>
                <ReaderPanel>
                    <StoryReader 
                        textSections={textSections}
                        handleWordClick={handleWordClick}
                        sourceLanguage={sourceLanguage}
                    />
                </ReaderPanel>
                <SidePanel 
                    contentData={contentData} 
                    pageCount={textSections.length}
                    questions={questions}
                    onGetQuestions={handleGetGoalQuestions}
                    onAnswerChange={handleAnswerChange}
                    loadingQuestions={loadingQuestions}
                    onCheckAnswers={handleCheckAnswers}
                />
                {tooltip.show && (
                    <Tooltip
                        top={tooltip.top}
                        left={tooltip.left}
                    >
                        <strong>{tooltip.word}</strong>: {tooltip.text}
                    </Tooltip>
                )}
            </ReadPageLayout>
        </BasicPage>
    );
}

export default Read; 