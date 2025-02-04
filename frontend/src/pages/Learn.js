import { useState, useEffect, useCallback } from 'react';
import { BrowserBox } from '../components/StyledComponents';
import StoryBrowser from '../components/StoryBrowser';
import WelcomeModal from '../components/WelcomeModal';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import TranslationPanel from '../components/TranslationPanel';

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
	const [allStories, setAllStories] = useState([]);

	const [showWelcome, setShowWelcome] = useState(false);

	const { showNotification } = useNotification();

	const apiBase = "https://api.squeak.today/";

	const navigate = useNavigate();

	const handleListStories = useCallback(async (type, language, cefrLevel, subject, page, pagesize) => {
		const tempStories = [];
		try {
			let newsData = [], storiesData = [];
			if (type === 'News') { newsData = await fetchContentList(apiBase, 'news-query', language, cefrLevel, subject, page, pagesize); }
			if (type === 'Story') { storiesData = await fetchContentList(apiBase, 'story-query', language, cefrLevel, subject, page, pagesize); }
			
			console.log('Fetched content successfully!')

			for (const story of newsData) {
				tempStories.push({
					id: story['id'],
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
					id: story['id'],
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
		navigate(`/read/${story.type}/${story.id}`);
	}

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
				
			</BrowserBox>

		</BasicPage>
	);
}

export default Learn; 