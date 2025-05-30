import { useState, useEffect, useCallback } from 'react';
import { BrowserBox, LearnPageLayout, StoryBrowserContainer, GreetingHeader, TabsContainer, Tab } from '../styles/LearnPageStyles';
import ContentBrowser from '../components/ContentBrowser';
import WelcomeModal from '../components/WelcomeModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import supabase from '../lib/supabase';
import NavPage from '../components/NavPage';
import NewsRecommendations from '../components/NewsRecommendations';
import StoryRecommendations from '../components/StoryRecommendations';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { welcomeMsg } from '../lib/welcome_msg';

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
	const [showWelcome, setShowWelcome] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const validTabs = ['today', 'search'];
	const defaultTab = 'today';
	
	const initialTab = searchParams.get('tab');
	const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : defaultTab);
	
	const { showNotification } = useNotification();
	const apiBase = import.meta.env.VITE_API_BASE;
	const navigate = useNavigate();

	const [profile, setProfile] = useState(null);

	const [storyRecommendations, setStoryRecommendations] = useState([]);

	const [isInitializing, setIsInitializing] = useState(true);

	const { getProfile } = useProfileAPI();

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

	const handleGetProfile = useCallback(async () => {
		try {
			const { data, error } = await getProfile();
			
			if (error?.code === "PROFILE_NOT_FOUND") {
				navigate('/welcome');
				return null;
			}
			
			setProfile(data);
			return data;
		} catch (error) {
			console.error('Error fetching profile:', error);
			showNotification('Failed to load profile. Please try again.', 'error');
			return null;
		}
	}, [getProfile, navigate, showNotification]);

	const fetchRecommendations = useCallback(async (language, cefrLevel) => {
		try {
			const storyRecommendations = await fetchContentList(apiBase, 'story/query', language, cefrLevel, 'any', 1, 5);
			const transformedStoryRecommendations = Array.isArray(storyRecommendations) 
				? storyRecommendations.map(story => ({
					id: story.id,
					title: story.title,
					cefr_level: story.cefr_level,
					language: story.language,
					topic: story.topic,
					pages: story.pages
				}))
				: [];
			setStoryRecommendations(transformedStoryRecommendations);
		} catch (error) {
			console.error("Failed to fetch story recommendations:", error);
			showNotification("Couldn't load story recommendations. Please try again later!", 'error');
			setStoryRecommendations([]);
		}
	}, [apiBase, showNotification]);

	useEffect(() => {
		const initializeProfile = async () => {
			const profileData = await handleGetProfile();
			console.log(profileData);
			if (profileData) {
				await fetchRecommendations(profileData.learning_language, profileData.skill_level);
			}
		};

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

		const init = async () => {
			try {
				await initializeProfile();
				await checkWelcomeStatus();
			} catch (error) {
				console.error('Error initializing profile:', error);
			} finally {
				setIsInitializing(false);
			}
		}
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setSearchParams({ tab }, { replace: true });
	};

	return (
		<NavPage isLoading={isInitializing}>
			{showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
			<BrowserBox>
				<LearnPageLayout>
					<StoryBrowserContainer>
						{profile && (
							<GreetingHeader>
								{welcomeMsg[profile.learning_language] + ` ${profile.username}!`}
							</GreetingHeader>
						)}
						
						<TabsContainer>
							<Tab isActive={activeTab === 'today'} 
								onClick={() => handleTabChange('today')}
							>
								Today
							</Tab>
							<Tab isActive={activeTab === 'search'} 
								onClick={() => handleTabChange('search')}
							>
								Search
							</Tab>
						</TabsContainer>
						
						{activeTab === 'today' && (
							<>
								{profile && (
									<NewsRecommendations 
										userLanguage={profile.learning_language} 
										cefrLevel={profile.skill_level} 
										interested_topics={profile.interested_topics}
									/>
								)}
								<StoryRecommendations recommendations={storyRecommendations} />
							</>
						)}
						
						{activeTab === 'search' && (
							<ContentBrowser 
								defaultLanguage={profile?.learning_language || 'any'}
							/>
						)}
					</StoryBrowserContainer>
				</LearnPageLayout>
			</BrowserBox>
		</NavPage>
	);
}

export default Learn; 