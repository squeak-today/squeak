import { useState, useEffect, useCallback } from 'react';
import { BrowserBox,
    StoryContainer,
    Tooltip,
    ModalContainer} from '../components/StyledComponents';
import StoryReader from '../components/StoryReader';
import StoryBrowser from '../components/StoryBrowser';
import WelcomeModal from '../components/WelcomeModal';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import TranslationPanel from '../components/TranslationPanel';

import { LANGUAGE_CODES_REVERSE } from '../lib/lang_codes';

const fetchContentList = async (apiBase, endpoint, language, cefrLevel, subject, page, pagesize) => {
	const url = `${apiBase}${endpoint}?language=${language}&cefr=${cefrLevel}&subject=${subject}&page=${page}&pagesize=${pagesize}`;
	const { data: { session } } = await supabase.auth.getSession();
	const jwt = session?.access_token
	const response = await fetch(url, {
		headers: {
			'Authorization': `Bearer ${jwt}`
		}
	});
	return response.json();
};

function Learn() {
	const [contentType, setContentType] = useState('');
	const [story, setStory] = useState(''); // State to store the story

	const [tooltip, setTooltip] = useState({ visible: false, word: '', top: 0, left: 0, definition: '' });

	const [allStories, setAllStories] = useState([]);

	const [isModalOpen, setIsModalOpen] = useState(false);

	const [isClosing, setIsClosing] = useState(false);

	const [showWelcome, setShowWelcome] = useState(false);

	const { showNotification } = useNotification();

	const [sourceLanguage, setSourceLanguage] = useState('fr');

	const [translationData, setTranslationData] = useState({
		word: '',
		wordTranslation: '',
		originalSentence: '',
		sentenceTranslation: ''
	  });
	
	// track if the panel should be displayed
	const [showTranslation, setShowTranslation] = useState(false);

	const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });


	const apiBase = "https://api.squeak.today/";
	let apiUrl = apiBase + contentType;

	const navigate = useNavigate();

	const pullStory = async (contentType, language, cefrLevel, subject, dateCreated) => {
		apiUrl = apiBase + contentType;
		let url = `${apiUrl}?language=${language}&cefr=${cefrLevel}&subject=${subject}&date_created=${dateCreated}`;
		
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const jwt = session?.access_token
			const response = await fetch(url, {
				headers: {
					'Authorization': `Bearer ${jwt}`
				}
			});
			if (!response.ok) {
				setStory("Failed to generate story");
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			console.log("Pulled story successfully!");
			setStory(data["content"]);
		} catch (error) {
			console.error("Error generating story:", error);
			setStory("");
			showNotification("Couldn't find that story. Please try again or come back later!", 'error');
		}
	};

	const fetchWordDefinition = async (word, sentence, source) => {
		let url = `${apiBase}translate`;
		let resultObject = {
		  wordTranslation: '',
		  sentenceTranslation: ''
		};

		let combinedTranslation = word + "   $$$....$$$   " + sentence;
	  
		const data = {
		  sentence: combinedTranslation,
		  source: source,
		  target: 'en'
		};
	  
		const { data: { session } } = await supabase.auth.getSession();
		const jwt = session?.access_token;
	
		try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${jwt}`,
			'Accept': 'application/json',
			},
			body: JSON.stringify(data)
		});
	
		const result = await response.json();
		console.log("Translation API response (json):", result);
	
		// Update here: use the "sentence" key from the API response.
		const translatedCombined = result.sentence || '';

		// Split the combined translation using your custom marker
		const parts = translatedCombined.split("$$$....$$$");
		
		if (parts.length === 2) {
		// Trim each part to remove any extra spaces
		resultObject.wordTranslation = parts[0].trim();
		resultObject.sentenceTranslation = parts[1].trim();
		} else {
		// If the split didn't work as expected, use the entire string as fallback
		resultObject.wordTranslation = translatedCombined;
		resultObject.sentenceTranslation = '';
		}
		} catch (error) {
			console.error('Translation error:', error);
		}
		
		console.log("word:",resultObject.wordTranslation)
		console.log(resultObject.sentenceTranslation)
			
		return resultObject;
	  };
		

	const handleWordClick = async (e, word, fullSentence, sourceLanguage) => {
		const { top, left } = e.target.getBoundingClientRect();
		// fetch both single-word & full-sentence translations
		const result = await fetchWordDefinition(word, fullSentence, sourceLanguage);
	  
		// store in your local translationData state
		setTranslationData({
		  word,
		  wordTranslation: result.wordTranslation,
		  originalSentence: fullSentence,
		  sentenceTranslation: result.sentenceTranslation
		});
	  
		setShowTranslation(true);
	  
		// return the translation to the child so it can display in the panel
		return {
		  wordTranslation: result.wordTranslation,
		  sentenceTranslation: result.sentenceTranslation
		};
	};
	  

	const closeTranslationPanel = () => {
    	setShowTranslation(false);
  	};
	
	const handleCloseTooltip = () => {
		setTooltip({ visible: false, word: '', top: 0, left: 0, definition: '' });
	};

	const handleListStories = useCallback(async (type, language, cefrLevel, subject, page, pagesize) => {
		const tempStories = [];
		try {
			let newsData = [], storiesData = [];
			if (type === 'News') { newsData = await fetchContentList(apiBase, 'news-query', language, cefrLevel, subject, page, pagesize); }
			if (type === 'Story') { storiesData = await fetchContentList(apiBase, 'story-query', language, cefrLevel, subject, page, pagesize); }
			
			console.log('Fetched content successfully!')

			for (const story of newsData) {
				tempStories.push({
					type: 'News',
					title: story['title'],
					preview: story['preview_text'],
					tags: [story['language'], story['topic']],
					difficulty: story['cefr_level'],
					date_created: story['date_created']
				});
			}
			for (const story of storiesData) {
				tempStories.push({
					type: 'Story',
					title: story['title'],
					preview: story['preview_text'],
					tags: [story['language'], story['topic']],
					difficulty: story['cefr_level'],
					date_created: story['date_created']
				});
			}
			setAllStories(tempStories);
		} catch (error) {
			console.error("Failed to fetch content:", error);
			showNotification("Couldn't get Squeak's content. Please try again or come back later!", 'error');
		}
	}, [apiBase, showNotification]);

	useEffect(() => {
		// using an "IIFE" to handle the handleListStories call,
		// basically only running on mount and ignoring any changes to handleListStories
		// this prevents a cyclical loop of errors if the fetch fails (and thus this would run infinitely)
		(async () => {
			try {
				await handleListStories('News','any', 'any', 'any', 1, 6);
			} catch (error) {
				console.error('Failed to fetch initial stories:', error);
			}
		})();
		// we're intentionally only running this on mount and accepting that handleListStories may change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleStoryBlockClick = async (story) => {
		setContentType((story.type).toLowerCase());
		setSourceLanguage(LANGUAGE_CODES_REVERSE[story.tags[0]]);
		await pullStory(story.type.toLowerCase(), story.tags[0], story.difficulty, story.tags[1], story.date_created);
		setIsModalOpen(true);
	}

	const handleCloseModal = () => {
		setIsClosing(true);
		// wait for anim to complete before removing from DOM
		setTimeout(() => {
			setIsModalOpen(false);
			setStory('');
			setIsClosing(false);
		}, 300); // Match animation duration
	};

	const handleModalClick = (e) => {
		if (e.target === e.currentTarget) { // not triggering on children
			handleCloseModal();
		}
	};

	useEffect(() => {
		// Check if user has seen welcome message in their metadata
		const checkWelcomeStatus = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (session) {
				const { data: { user } } = await supabase.auth.getUser();
				const hasSeenWelcome = user?.user_metadata?.has_seen_welcome;
				
				if (!hasSeenWelcome) {
					setShowWelcome(true);
				}
			}
		};

		checkWelcomeStatus();
	}, []);

	const handleCloseWelcome = async () => {
		try {
			// Update user metadata to record that they've seen the welcome message
			const { error } = await supabase.auth.updateUser({
				data: { has_seen_welcome: true }
			});

			if (error) throw error;
			setShowWelcome(false);
		} catch (error) {
			console.error('Error updating user metadata:', error);
			setShowWelcome(false); // Still close the modal even if update fails
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

	return (
		<BasicPage showLogout onLogout={handleLogout}>

			{showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
			<BrowserBox>
				<StoryBrowser 
					stories={allStories} 
					onParamsSelect={handleListStories} 
					onStoryBlockClick={handleStoryBlockClick}
				/>
				
				{story && isModalOpen && (
					<ModalContainer onClick={handleModalClick} $isClosing={isClosing}>
						<StoryContainer $isClosing={isClosing}>
						<StoryReader
							data={story}
							handleWordClick={(e, word, fullSentence, sourceLanguage) => {
								const { top, left } = e.target.getBoundingClientRect();
								setPanelPosition({ top, left });
								return handleWordClick(e, word, fullSentence, sourceLanguage);
							}}
							sourceLanguage={sourceLanguage}
						/>
						</StoryContainer>
					</ModalContainer>
				)}

				{showTranslation && (
					<TranslationPanel
					data={translationData}
					onClose={closeTranslationPanel}
					top={panelPosition.top}
					left={panelPosition.left}
					/>
				)}
			</BrowserBox>

		</BasicPage>
	);
}

export default Learn; 