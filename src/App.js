import './App.css';
import { generateStory } from './cohere';
import { generateDefinition } from './defns';
import { useState } from 'react';
import styled from 'styled-components';


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

// Centered story title
const StoryTitle = styled.h2`
	text-align: center; // Center the story title
	color: #8a1000; // Optional: Match the theme color
`;

const StoryText = styled.div`
	margin-top: 20px;
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

function App() {
	const [cohereApiKey, setCohereApiKey] = useState('');
	const [googleApiKey, setGoogleApiKey] = useState('');
	const [topic, setTopic] = useState('');
	const [language, setLanguage] = useState('');
	const [CEFRLevel, setCEFRLevel] = useState('');
	const [story, setStory] = useState(''); // State to store the story
	const [loading, setLoading] = useState(false); // State to manage loading state

	const [tooltip, setTooltip] = useState({ visible: false, word: '', top: 0, left: 0, definition: '' });

	const isFormComplete = cohereApiKey && topic && language && CEFRLevel;

	const handleGenerateStory = async () => {
		setLoading(true); // Set loading state to true when fetching story
		try {
			const newStory = await generateStory(cohereApiKey, topic, language, CEFRLevel, []);
			setStory(newStory); // Store the fetched story in the state
		} catch (error) {
			console.error("Error generating story:", error);
			setStory("Failed to generate story. Please try again.");
		}
		setLoading(false); // Set loading state to false when finished
	};

	const fetchWordDefinition = async (word) => {
		try {
			const newDefinition = await generateDefinition(googleApiKey, word, language);
			return newDefinition;
		} catch (error) {
			console.error("Error generating story:", error);
			return `Failed to generate definition for ${word}.`
		}
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
    	<StyledBox>
			<Title>Squeak</Title>

			<InputField
				type="text"
				placeholder="Enter your Cohere API key"
				value={cohereApiKey}
				onChange={(e) => setCohereApiKey(e.target.value)}
			/>

			<InputField
				type="text"
				placeholder="Enter your Google Cloud Translation API key"
				value={googleApiKey}
				onChange={(e) => setGoogleApiKey(e.target.value)}
			/>

			<InputField
				type="text"
				placeholder="Enter a topic"
				value={topic}
				onChange={(e) => setTopic(e.target.value)}
			/>

			{/* Dropdown for language selection */}
			<SelectField value={language} onChange={(e) => setLanguage(e.target.value)}>
				<option value="" disabled>Select a language</option>
				<option value="English">English</option>
				<option value="French">French</option>
				<option value="Spanish">Spanish</option>
			</SelectField>

			{/* Dropdown for CEFR level selection */}
			<SelectField value={CEFRLevel} onChange={(e) => setCEFRLevel(e.target.value)}>
				<option value="" disabled>Select a CEFR level</option>
				<option value="A1">A1</option>
				<option value="A2">A2</option>
				<option value="B1">B1</option>
				<option value="B2">B2</option>
				<option value="C1">C1</option>
				<option value="C2">C2</option>
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
					<StoryText>
						{story.split(' ').map((word, index) => (
							<Word key={index} onClick={(e) => handleWordClick(e, word)}>
								{word}
							</Word>
						))}
					</StoryText>
				</StoryContainer>
			)}

			{/* displaying the word definition */}
			{tooltip.visible && (
				<Tooltip top={tooltip.top} left={tooltip.left} onClick={handleCloseTooltip}>
				<strong>{tooltip.word}</strong>: {tooltip.definition}
				</Tooltip>
			)}
		</StyledBox>
	);
}

export default App;
