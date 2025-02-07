import { useState, useEffect, useCallback } from 'react';
import { BrowserBox, LearnPageLayout, StoryBrowserContainer, ProfileDashboardContainer, DateHeader } from '../styles/LearnPageStyles';
import StoryBrowser from '../components/StoryBrowser';
import WelcomeModal from '../components/WelcomeModal';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import ProfileDashboard from '../components/ProfileDashboard';
import NewsRecommendations from '../components/NewsRecommendations';

const formatDate = () => {
	const date = new Date();
	const month = date.toLocaleDateString('en-US', { month: 'long' });
	const day = date.getDate();
	const year = date.getFullYear();

	const getOrdinal = (n) => {
		if (n > 3 && n < 21) return 'th';
		switch (n % 10) {
			case 1: return 'st';
			case 2: return 'nd';
			case 3: return 'rd';
			default: return 'th';
		}
	};

	return `${month} ${day}${getOrdinal(day)}, ${year}`;
};

const fetchContentList = async (apiBase, endpoint, language, cefrLevel, subject, page, pagesize) => {
	const url = `${apiBase}${endpoint}?language=${language}&cefr=${cefrLevel}&subject=${subject}&page=${page}&pagesize=${pagesize}`;
	const { data: { session } } = await supabase.auth.getSession();
	const jwt = session?.access_token
	console.log(jwt);
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

	const apiBase = process.env.REACT_APP_API_BASE;

	const navigate = useNavigate();

	const [profile, setProfile] = useState(null);

	const [recommendations, setRecommendations] = useState([]);

	const [progress, setProgress] = useState(null);

	const handleStoryBlockClick = async (story) => {
		navigate(`/read/${story.type}/${story.id}`);
	}

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

	const handleGetProfile = useCallback(async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const jwt = session?.access_token;
			
			const response = await fetch(`${apiBase}profile`, {
				headers: {
					'Authorization': `Bearer ${jwt}`
				}
			});
			
			const data = await response.json();
			
			if (data.code === "PROFILE_NOT_FOUND") {
				navigate('/welcome');
				return null;
			}
			
			if (!response.ok) throw new Error('Failed to fetch profile');
			
			setProfile(data);
			return data;
		} catch (error) {
			console.error('Error fetching profile:', error);
			showNotification('Failed to load profile. Please try again.', 'error');
			return null;
		}
	}, [apiBase, navigate, showNotification]);

	const fetchRecommendations = useCallback(async (language, cefrLevel) => {
		try {
			const recommendedNews = await fetchContentList(apiBase, 'news-query', language, cefrLevel, 'any', 1, 5);
			const transformedRecommendations = recommendedNews.map(story => ({
				id: story.id,
				title: story.title,
				cefr_level: story.cefr_level,
				language: story.language,
				topic: story.topic
			}));
			setRecommendations(transformedRecommendations);
		} catch (error) {
			console.error("Failed to fetch recommendations:", error);
			showNotification("Couldn't load recommendations. Please try again later!", 'error');
			setRecommendations([]);
		}
	}, [apiBase, showNotification]);

	const fetchProgress = useCallback(async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const jwt = session?.access_token;
			
			const [progressResponse, streakResponse] = await Promise.all([
				fetch(`${apiBase}progress/`, {
					headers: {
						'Authorization': `Bearer ${jwt}`
					}
				}),
				fetch(`${apiBase}progress/streak`, {
					headers: {
						'Authorization': `Bearer ${jwt}`
					}
				})
			]);
			
			if (!progressResponse.ok || !streakResponse.ok) 
				throw new Error('Failed to fetch progress data');
			
			const progressData = await progressResponse.json();
			const streakData = await streakResponse.json();

			// Combine the data
			setProgress({
				...progressData,
				streak: streakData.streak,
				completed_today: streakData.completed_today
			});
			
			return progressData;
		} catch (error) {
			console.error('Error fetching progress:', error);
			showNotification('Failed to load progress. Please try again.', 'error');
		}
	}, [apiBase, showNotification]);

	const handleUpdateProfile = useCallback(async (profileData) => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const jwt = session?.access_token;
			
			const response = await fetch(`${apiBase}profile-upsert`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(profileData)
			});
			
			const result = await response.json();
			if (result.message === "Username already taken") {
				showNotification('Username already taken. Please try again.', 'error');
				return;
			}
			if (!response.ok) throw new Error('Failed to update profile');
			setProfile(profileData);
			await fetchRecommendations(profileData.learning_language, profileData.skill_level);
			await fetchProgress();
			
			showNotification('Profile updated successfully!', 'success');
			return result;
		} catch (error) {
			console.error('Error updating profile:', error);
			showNotification('Failed to update profile. Please try again.', 'error');
		}
	}, [fetchRecommendations, fetchProgress, showNotification, apiBase]);

	useEffect(() => {
		const initializeProfile = async () => {
			const profileData = await handleGetProfile();
			if (profileData) {
				await fetchRecommendations(profileData.learning_language, profileData.skill_level);
				await fetchProgress();
			}
		};

		const initializeBrowser = async () => {
			try {
				await handleListStories('News','any', 'any', 'any', 1, 6);
			} catch (error) {
				console.error('Failed to fetch initial stories:', error);
			}
		}

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

		initializeProfile();
		initializeBrowser();
		checkWelcomeStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<BasicPage showLogout onLogout={handleLogout}>
			{showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
			<BrowserBox>
				<LearnPageLayout>
					<StoryBrowserContainer>
						<DateHeader>Today is {formatDate()}...</DateHeader>
						<NewsRecommendations recommendations={recommendations} />
						<StoryBrowser 
							stories={allStories} 
							onParamsSelect={handleListStories} 
							onStoryBlockClick={handleStoryBlockClick}
							defaultLanguage={profile?.learning_language || 'any'}
						/>
					</StoryBrowserContainer>
					
					<ProfileDashboardContainer>
						<ProfileDashboard
							profile={profile}
							progress={progress}
							onGetProfile={handleGetProfile}
							onUpdateProfile={handleUpdateProfile}
						/>
					</ProfileDashboardContainer>
				</LearnPageLayout>
			</BrowserBox>
		</BasicPage>
	);
}

export default Learn; 