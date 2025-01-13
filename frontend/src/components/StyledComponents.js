import styled from 'styled-components';

const StyledBox = styled.div`
	width: 80%;
	margin: 20px auto;
	padding: 20px;
	border: 2px solid #000000;
	border-radius: 15px;
	background-color: #e0e0e0;
	box-sizing: border-box;
	overflow: hidden;
`;

const Title = styled.h1`
	text-align: center;
	color: #000000;
	font-family: 'Noto Serif', serif;
	font-size: 3.5rem;
	margin-bottom: 10px;
`;

const Subtitle = styled.h3`
	text-align: center;
	color: #000000;
	font-family: 'Noto Serif', serif;
	font-size: 1.8rem;
	margin-top: 0;
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
	background-color: white;
`;

// Centered story title
const StoryTitle = styled.h2`
	text-align: center;
	color: black;
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

export { StyledBox, Title, Subtitle, GenerateButton, StoryContainer, StoryTitle, InputField, Tooltip };