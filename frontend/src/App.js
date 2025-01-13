import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { StyledBox, 
	Title,
	Subtitle,
	StoryContainer,
	Tooltip,
	ModalContainer,
	CloseModalButton} from './components/StyledComponents';
import AuthBlocks from './components/AuthBlocks';

import StoryReader from './components/StoryReader';
import StoryBrowser from './components/StoryBrowser';

const fetchContent = async (apiBase, endpoint, language, cefrLevel, subject) => {
	const url = `${apiBase}${endpoint}?language=${language}&cefr=${cefrLevel}&subject=${subject}`;
	const response = await fetch(url);
	if (!response.ok) { throw new Error(`Failed to fetch from ${endpoint}`); }
	return response.json();
};

function App() {
	const [contentType, setContentType] = useState('');
	const [story, setStory] = useState(''); // State to store the story

	const [tooltip, setTooltip] = useState({ visible: false, word: '', top: 0, left: 0, definition: '' });

	const [allStories, setAllStories] = useState([]);

	const [isModalOpen, setIsModalOpen] = useState(false);

	const apiBase = "https://api.squeak.today/";
	let apiUrl = apiBase + contentType;

	const pullStory = async (contentType, language, cefrLevel, subject) => {
		apiUrl = apiBase + contentType;

		let url = `${apiUrl}?language=${language}&cefr=${cefrLevel}&subject=${subject}`;
		fetch(url).then(response => {
			if (!response.ok) {
				setStory("Failed to generate story");
				throw new Error("Network response was not ok");
			}
			return response.json();
		}).then(data => {
			console.log("Pulled story successfully!");
			setStory(data["content"]);
		}).catch(error => {
			console.error("Error generating story:", error);
			setStory("Failed to generate story");
		})
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
		.catch(error => {console.error('ERROR: ', error)})
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
		}
	}, [apiBase]); // apiBase is the only dependency

	useEffect(() => {
		handleListStories('any', 'any', 'any');
	}, [handleListStories]); // Now we can safely add handleListStories as a dependency

	const handleStoryBlockClick = async (story) => {
		setContentType((story.type).toLowerCase());
		await pullStory(story.type.toLowerCase(), story.tags[0], story.difficulty, story.tags[1]);
		setIsModalOpen(true);
	}

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setStory('');
	}

	return (
		<div>
			<StyledBox>
				<Title>Squeak</Title>
				<Subtitle>Comprehensive Input Made Easy!</Subtitle>

				<StoryBrowser 
					stories={allStories} 
					onParamsSelect={handleListStories} 
					onStoryBlockClick={(story) => { handleStoryBlockClick(story) }}
				/>
				
				{story && isModalOpen && (
					<ModalContainer>
						<StoryContainer>
							<CloseModalButton onClick={handleCloseModal}>X</CloseModalButton>
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
			</StyledBox>
			<AuthBlocks />
		</div>
	);
}

export default App;
