import './App.css';
import { useState, useContext } from 'react';
import { Account, AccountContext } from './Account';
import styled from 'styled-components';

import UserPool from "./UserPool";
import Status from "./Status";

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
`;

const StoryBox = styled.div`
	padding: 20px;
	margin: 20px 0;
	border: 2px solid #AB560C; // Optional: Border color matching the theme
	border-radius: 15px; // Rounded corners
	background-color: #fad2af; // Light fill color to differentiate it from the background
`;

// Centered story title
const StoryTitle = styled.h2`
	text-align: center; // Center the story title
	color: #8a1000; // Optional: Match the theme color
`;

const StoryText = styled.div`
	text-align: left;
	line-height: 1.5;
	white-space: normal; // Ensure text wraps at word boundaries
	word-break: keep-all; // Prevent breaking words in the middle
	overflow-wrap: normal; // Prevent breaking words unnecessarily
	display: flex; // Use flex display to keep all words in a line and wrap naturally
	flex-wrap: wrap; // Enable wrapping within the flex container
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

// Styled word component with hover and cursor pointer
const Word = styled.span`
	display: inline;
	margin-right: 5px;
	cursor: pointer;
	&:hover {
	text-decoration: underline;
	}
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
	const [story, setStory] = useState(''); // State to store the story
	const [loading, setLoading] = useState(false); // State to manage loading state

	const [tooltip, setTooltip] = useState({ visible: false, word: '', top: 0, left: 0, definition: '' });

	const isFormComplete = language && CEFRLevel;
	const apiUrl = "https://api.squeak.today/story";

	const handleGenerateStory = async () => {
		setLoading(true); // Set loading state to true when fetching story
		let url = `${apiUrl}?language=${language}&cefr=${CEFRLevel}&subject=${subject}`;
		fetch(url).then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		}).then(data => {
			console.log("Pulled Story!", data["content"]);
			setStory(data["content"]);
			setLoading(false); // Set loading state to false when finished
		}).catch(error => {
			console.error("Error generating story:", error);
			setStory("Failed to generate story. Please try again.");
		})
	};

	const fetchWordDefinition = async (word) => {
		return "";
	};

	const handleWordClick = async (e, word) => {
		const definition = await fetchWordDefinition(word);
		const { top, left } = e.target.getBoundingClientRect();
		setTooltip({ visible: true, word, top: top + window.scrollY + 20, left: left + window.scrollX, definition });
	};
	
	const handleCloseTooltip = () => {
		setTooltip({ visible: false, word: '', top: 0, left: 0, definition: '' });
	};

	return (
		<Account>
			
			<Status />
			<SignUp />
			<Login />

			<StyledBox>
				<Title>Squeak</Title>
				<Subtitle>Comprehensive Input Made Easy!</Subtitle>

				{/* Dropdown for language selection */}
				<SelectField value={language} onChange={(e) => setLanguage(e.target.value)}>
					<option value="" disabled>Select a language</option>
					<option value="French">French</option>
				</SelectField>

				{/* Dropdown for CEFR level selection */}
				<SelectField value={CEFRLevel} onChange={(e) => setCEFRLevel(e.target.value)}>
					<option value="" disabled>Select a CEFR level</option>
					{/* <option value="B1">B1</option> */}
					<option value="A1">A1</option>
					<option value="B2">B2</option>
				</SelectField>

				{/* Dropdown for subject selection */}
				<SelectField value={subject} onChange={(e) => setSubject(e.target.value)}>
					<option value="" disabled>Select a subject</option>
					<option value="Politics">Politics</option>
				</SelectField>

				<ButtonContainer>
					<GenerateButton onClick={handleGenerateStory} disabled={!isFormComplete || loading}>
						{loading ? 'Generating Story...' : 'Generate Story'}
					</GenerateButton>
				</ButtonContainer>
				{story && (
					<StoryContainer>
						<StoryTitle>Generated Story</StoryTitle>
						{/* Split the story into words and make each word clickable */}
						<StoryBox>
							<StoryText>
								<p>{story}</p>
								{/*
								{story.split(' ').map((word, index) => (
									<Word key={index} onClick={(e) => handleWordClick(e, word)}>
										{word}
									</Word>
								))}
								*/}

							</StoryText>
						</StoryBox>
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
