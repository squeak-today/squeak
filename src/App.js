import './App.css';
import { generateStory } from './cohere';
import { useState } from 'react';
import styled from 'styled-components';


const StyledBox = styled.div`
	width: 80%;
	margin: 20px auto; // Center the box horizontally with margin
	padding: 20px; // Add padding inside the box
	border: 2px solid #AB560C;
	border-radius: 15px; // Rounded corners
	background-color: #f7bc88; // fill color
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

const StoryText = styled.div`
	margin-top: 20px;
	text-align: left;
	line-height: 1.5;
`;


const InputField = styled.input`
	width: 100%;
	padding: 10px;
	margin: 10px 0;
	border: 1px solid #ccc;
	border-radius: 5px;
`;

const SelectField = styled.select`
	width: 100%;
	padding: 10px;
	margin: 10px 0;
	border: 1px solid #ccc;
	border-radius: 5px;
`;

function App() {
	const [apiKey, setApiKey] = useState('');
	const [topic, setTopic] = useState('');
	const [language, setLanguage] = useState('');
	const [CEFRLevel, setCEFRLevel] = useState('');
	const [story, setStory] = useState(''); // State to store the story
	const [loading, setLoading] = useState(false); // State to manage loading state

	const isFormComplete = apiKey && topic && language && CEFRLevel;

	const handleGenerateStory = async () => {
		setLoading(true); // Set loading state to true when fetching story
		try {
			const apiKey = process.env.REACT_APP_COHERE_API_KEY;
			const newStory = await generateStory(apiKey, topic, language, CEFRLevel, []);
			setStory(newStory); // Store the fetched story in the state
		} catch (error) {
			console.error("Error generating story:", error);
			setStory("Failed to generate story. Please try again.");
		}
		setLoading(false); // Set loading state to false when finished
	};


	return (
    	<StyledBox>
			<h1>Squeak</h1>

			<InputField
				type="text"
				placeholder="Enter your Cohere API key"
				value={apiKey}
				onChange={(e) => setApiKey(e.target.value)}
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


			<GenerateButton onClick={handleGenerateStory} disabled={!isFormComplete || loading}>
				{loading ? 'Generating Story...' : 'Generate Story'}
			</GenerateButton>
			{story && (
				<StoryText>
					<h2>Today's Story</h2>
					<p>{story}</p>
				</StoryText>
			)}
		</StyledBox>
	);
}

export default App;
