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
import { createClient } from '@supabase/supabase-js';
import BasicPage from '../components/BasicPage';

const supabase = createClient(
	process.env.REACT_APP_SUPABASE_URL,
	process.env.REACT_APP_SUPABASE_ANON_KEY
);

const fetchContent = async (apiBase, endpoint, language, cefrLevel, subject) => {
	const url = `${apiBase}${endpoint}?language=${language}&cefr=${cefrLevel}&subject=${subject}`;
	const response = await fetch(url);
	if (!response.ok) {
		console.error(`Failed to fetch from ${endpoint}`);
	}
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

	const apiBase = "https://api.squeak.today/";
	let apiUrl = apiBase + contentType;

	const navigate = useNavigate();

	const pullStory = async (contentType, language, cefrLevel, subject) => {
		apiUrl = apiBase + contentType;
		let url = `${apiUrl}?language=${language}&cefr=${cefrLevel}&subject=${subject}`;
		
		try {
			const response = await fetch(url);
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

	const fetchWordDefinition = async (word) => {
		let url = `${apiBase}translate`;
		let translation = "";
		const data = {
			sentence: word,
			source: 'fr',
			target: 'en'
		};
		await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(response => response.json())
		.then(result => {
			console.log('Successful word translation!');
			console.log(result);
			translation = result["sentence"].toString();
		})
		.catch(error => {
			console.error('ERROR: ', error);
			showNotification("Couldn't find that word. Please try again or come back later!", 'error');
		})
		return translation;
	};

	const handleWordClick = async (e, word) => {
		const definition = await fetchWordDefinition(word);
		const { top, left } = e.target.getBoundingClientRect();
		setTooltip({ visible: true, word, top: top + window.scrollY + 20, left: left + window.scrollX, definition });
	};
	
	const handleCloseTooltip = () => {
		setTooltip({ visible: false, word: '', top: 0, left: 0, definition: '' });
	};

	const handleListStories = useCallback(async (language, cefrLevel, subject) => {
		const tempStories = [];
		try {
			const newsData = await fetchContent(apiBase, 'news-query', language, cefrLevel, subject);
			const storiesData = await fetchContent(apiBase, 'story-query', language, cefrLevel, subject);
			console.log('Fetched content successfully!')

			for (const story of newsData) {
				tempStories.push({
					type: 'News',
					title: story['title'],
					preview: story['preview_text'],
					tags: [story['language'], story['topic']],
					difficulty: story['cefr_level']
				});
			}
			for (const story of storiesData) {
				tempStories.push({
					type: 'Story',
					title: story['title'],
					preview: story['preview_text'],
					tags: [story['language'], story['topic']],
					difficulty: story['cefr_level']
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
				await handleListStories('any', 'any', 'any');
			} catch (error) {
				console.error('Failed to fetch initial stories:', error);
			}
		})();
		// we're intentionally only running this on mount and accepting that handleListStories may change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleStoryBlockClick = async (story) => {
		setContentType((story.type).toLowerCase());
		await pullStory(story.type.toLowerCase(), story.tags[0], story.difficulty, story.tags[1]);
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
							<StoryReader data={story} handleWordClick={handleWordClick} />
						</StoryContainer>
					</ModalContainer>
				)}

				{/* displaying the word definition */}
				{tooltip.visible && (
					<Tooltip top={tooltip.top} left={tooltip.left} onClick={handleCloseTooltip}>
					<strong>{tooltip.word}</strong>: {tooltip.definition}
					</Tooltip>
				)}
			</BrowserBox>

		</BasicPage>
	);
}

export default Learn; 