import './App.css';
import { useState, useContext, useEffect } from 'react';
import { Account, AccountContext } from './Account';
import { StyledBox, 
	Title,
	Subtitle,
	GenerateButton,
	StoryContainer,
	StoryTitle,
	InputField,
	Tooltip } from './components/StyledComponents';

import UserPool from "./UserPool";
import Status from "./Status";

import StoryReader from './components/StoryReader';
import StoryBrowser from './components/StoryBrowser';

const SignUp = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [authCode, setAuthCode] = useState("");
	const { confirmUser } = useContext(AccountContext);

	const onSubmit = (event) => {
		event.preventDefault();

		UserPool.signUp(email, password, [], null, (err, data) => {
			if (err) {
				console.error(err);
			}
			console.log(data);
		});
	}

	const onConfirmSubmit = (event) => {
		event.preventDefault();
		console.log(email);
		console.log(authCode);
		confirmUser(email, authCode).then(data => {
			console.log("Confirmed!", data);
		})
		.catch((err) => {
			console.error("Failed to confirm!", err);
		})
	};

	return (
		<StyledBox>
			{/* ugly sign-in */}
			<div>
				<Subtitle>Create Account</Subtitle>
				<form onSubmit={onSubmit}>
					<InputField
						value={email}
						placeholder="Email"
						onChange={(event) => setEmail(event.target.value)}>
					</InputField>
					<InputField
						value={password}
						type="password"
						placeholder="Password"
						onChange={(event) => setPassword(event.target.value)}>
					</InputField>
					<GenerateButton type="submit">Signup</GenerateButton>
				</form>
				
				<Subtitle>Confirm User</Subtitle>
				<form onSubmit={onConfirmSubmit}>
					<InputField
						value={email}
						placeholder="Email"
						onChange={(event) => setEmail(event.target.value)}>
					</InputField>
					<InputField
						value={authCode}
						placeholder="Authentication Code"
						onChange={(event) => setAuthCode(event.target.value)}>
					</InputField>
					<GenerateButton type="submit">Submit</GenerateButton>
				</form>
			</div>
		</StyledBox>
	)
}

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { authenticate } = useContext(AccountContext); 

	const onSubmit = (event) => {
		event.preventDefault();
		authenticate(email, password).then(data => {
			console.log("Logged in!", data);
		})
		.catch((err) => {
			console.error("Failed to log in!", err);
		})
	}

	return (
		<StyledBox>
			<Subtitle>Login</Subtitle>
			{/* ugly sign-in */}
			<div>
				<form onSubmit={onSubmit}>
					<InputField
						value={email}
						placeholder="Email"
						onChange={(event) => setEmail(event.target.value)}>
					</InputField>
					<InputField
						value={password}
						type="password"
						placeholder="Password"
						onChange={(event) => setPassword(event.target.value)}>
					</InputField>
					<GenerateButton type="submit">Login</GenerateButton>
				</form>
			</div>
		</StyledBox>
	)
}

function App() {
	const [language, setLanguage] = useState('');
	const [CEFRLevel, setCEFRLevel] = useState('');
	const [subject, setSubject] = useState('');
	const [contentType, setContentType] = useState('');
	const [story, setStory] = useState(''); // State to store the story
	const [loading, setLoading] = useState(false); // State to manage loading state
	const [title, setTitle] = useState('');

	const [tooltip, setTooltip] = useState({ visible: false, word: '', top: 0, left: 0, definition: '' });

	const [allStories, setAllStories] = useState([]);

	const apiBase = "https://api.squeak.today/";
	let apiUrl = apiBase + contentType;

	const pullStory = async (contentType, language, cefrLevel, subject) => {
		setLoading(true);
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
			setLoading(false); // Set loading state to false when finished
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

	const fetchContent = async (endpoint, language, cefrLevel, subject) => {
		const url = `${apiBase}${endpoint}?language=${language}&cefr=${cefrLevel}&subject=${subject}`;
		const response = await fetch(url);
		if (!response.ok) { throw new Error(`Failed to fetch from ${endpoint}`); }
		return response.json();
	};

	const handleListStories = async (language, cefrLevel, subject) => {
		const tempStories = [];
		try {
			const newsData = await fetchContent('news-query', language, cefrLevel, subject);
			const storiesData = await fetchContent('story-query', language, cefrLevel, subject);
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
	};

	const handleStoryBlockClick = async (story) => {
		setContentType((story.type).toLowerCase());
		setCEFRLevel(story.difficulty);
		setSubject(story.tags[1]);
		setLanguage(story.tags[0]);
		setTitle(story.title);
		await pullStory(story.type.toLowerCase(), story.tags[0], story.difficulty, story.tags[1]);
	}

	useEffect(() => {
		handleListStories('any', 'any', 'any');
	}, []); // Empty dependency array means this runs once on mount

	return (
		<Account>
			<StyledBox>
				<Title>Squeak</Title>
				<Subtitle>Comprehensive Input Made Easy!</Subtitle>

				<StoryBrowser 
					stories={allStories} 
					onParamsSelect={handleListStories} 
					onStoryBlockClick={(story) => { handleStoryBlockClick(story) }}
				/>
				{story && (
					<StoryContainer>
						<StoryTitle>{(title === '' ? 'Story' : title)}</StoryTitle>
						{/* Split the story into words and make each word clickable */}
						<StoryReader data={story} handleWordClick={handleWordClick} />
					</StoryContainer>
				)}

				{/* displaying the word definition */}
				{tooltip.visible && (
					<Tooltip top={tooltip.top} left={tooltip.left} onClick={handleCloseTooltip}>
					<strong>{tooltip.word}</strong>: {tooltip.definition}
					</Tooltip>
				)}
			</StyledBox>

			<Status />
			<SignUp />
			<Login />
		</Account>
	);
}

export default App;
