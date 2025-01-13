import './App.css';
import { useState, useContext, useEffect } from 'react';
import { Account, AccountContext } from './Account';
import styled from 'styled-components';

import UserPool from "./UserPool";
import Status from "./Status";

import StoryReader from './components/StoryReader';
import StoryBrowser from './components/StoryBrowser';

const StyledBox = styled.div`
	width: 80%;
	margin: 20px auto; // Center the box horizontally with margin
	padding: 20px; // Add padding inside the box
	border: 2px solid #AB560C;
	border-radius: 15px; // Rounded corners
	background-color: #f7bc88; // fill color
	box-sizing: border-box;
	overflow: hidden;
`;

const Title = styled.h1`
	text-align: center;
	color: #8a1000; // Match the theme color
`;

const Subtitle = styled.h3`
	text-align: center;
	color: #8a1000;
`;

const ButtonContainer = styled.div`
	display: flex;
	justify-content: center; // Center the button horizontally
	margin-top: 0px;
`;

const GenerateButton = styled.button`
	padding: 10px 20px;
	margin-top: 20px;
	font-size: 16px;
	cursor: pointer;
	background-color: #ffa47d; // Button background color
	color: black;
	border: 1px solid #FC4A00;
	border-radius: 5px;
	&:disabled {
	background-color: #c98061; // Lighter shade when disabled
	cursor: not-allowed;
	}
`;

const StoryContainer = styled.div`
	margin-top: 20px;
	text-align: left;
	position: relative;
	max-width: 100%; // Prevent container from exceeding 100% width
	word-wrap: normal; // Reset word-wrap to prevent breaking words
	word-break: keep-all; // Prevent words from breaking mid-way
	overflow-wrap: normal;
	box-sizing: border-box; // Include padding and border in the width

	padding: 10px;
	border-radius: 15px;
	
	// Fonts
	font-family: 'Noto Serif', serif;
	background-color: #f0f0f0;
`;

// Centered story title
const StoryTitle = styled.h2`
	text-align: center; // Center the story title
	color: #333; // Optional: Match the theme color
`;


const InputField = styled.input`
	width: 100%;
	padding: 10px;
	margin: 10px 0;
	border: 1px solid #AB560C;
	border-radius: 5px;
	background-color: #ffcfa5; // Input field background color
	color: black;
	font-size: 16px;
	&::placeholder {
	color: #AB560C;
	}
	&:focus {
	border-color: #FC4A00; // Focus state border color
	outline: none;
	}
	box-sizing:border-box;
`;

// Styled select field component
const SelectField = styled.select`
	width: 100%;
	padding: 10px;
	margin: 10px 0;
	border: 1px solid #AB560C;
	border-radius: 5px;
	background-color: #ffcfa5; // Select field background color
	color: black;
	font-size: 16px;
	&:focus {
	border-color: #FC4A00; // Focus state border color
	outline: none;
	}
	box-sizing:border-box;
`;

// Tooltip styled-component for displaying word definitions
const Tooltip = styled.div`
	position: absolute;
	top: ${(props) => props.top || 0}px;
	left: ${(props) => props.left || 0}px;
	padding: 10px;
	background-color: #ffcfa5;
	border: 1px solid #AB560C;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	font-size: 14px;
	width: 200px;
	z-index: 1000;
`;

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

	const [tooltip, setTooltip] = useState({ visible: false, word: '', top: 0, left: 0, definition: '' });

	const [allStories, setAllStories] = useState([]);

	const isFormComplete = language && CEFRLevel;
	const apiBase = "https://api.squeak.today/";
	const apiUrl = apiBase + contentType;

	const handleGenerateStory = async () => {
		setLoading(true); // Set loading state to true when fetching story

		let url = `${apiUrl}?language=${language}&cefr=${CEFRLevel}&subject=${subject}`;
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

	const handleStoryBlockClick = (story) => {
		setContentType((story.type).toLowerCase());
		setCEFRLevel(story.difficulty);
		setSubject(story.tags[1]);
		setLanguage(story.tags[0]);
		handleGenerateStory();
	}

	useEffect(() => {
		handleListStories('any', 'any', 'any');
	}, []); // Empty dependency array means this runs once on mount

	return (
		<Account>
			
			<Status />
			<SignUp />
			<Login />

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
						<StoryTitle>Story</StoryTitle>
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
		</Account>
	);
}

export default App;
