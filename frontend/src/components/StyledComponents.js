import styled from 'styled-components';

export const BrowserBox = styled.div`
	width: 100%;
	height: 100%;
	margin: 80px auto 0 auto;
	padding: 20px;
	background-color: #ffffff;
	box-sizing: border-box;
	overflow: hidden;
`;

export const Title = styled.h1`
	text-align: center;
	color: #000000;
	font-family: 'Noto Serif', serif;
	font-size: 3.5rem;
	margin-bottom: 10px;
`;

export const Subtitle = styled.h3`
	text-align: center;
	color: #000000;
	font-family: 'Noto Serif', serif;
	font-size: 1.8rem;
	margin-top: 0;
`;

export const GenerateButton = styled.button`
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

export const StoryContainer = styled.div`
	position: relative;
	background-color: white;
	padding: 5px 30px;
	border-radius: 15px;
	font-family: 'Noto Serif', serif;
	
	max-width: 90vw;
	max-height: 80vh;
	overflow-y: auto;

	padding-top: 10px;
	box-sizing: border-box;

	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	animation: ${props => props.$isClosing ? 'slideOut' : 'slideIn'} 0.3s ease forwards;
	transform: ${props => props.$isClosing ? 'translateY(0)' : 'translateY(20px)'};
	opacity: ${props => props.$isClosing ? 1 : 0};

	@keyframes slideIn {
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slideOut {
		to {
			transform: translateY(20px);
			opacity: 0;
		}
	}
`;

// Centered story title
export const StoryTitle = styled.h2`
	text-align: center;
	color: black;
`;


export const InputField = styled.input`
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
export const Tooltip = styled.div`
	position: absolute;
	top: ${(props) => props.top || 0}px;
	left: ${(props) => props.left || 0}px;
	padding: 10px;
	background-color: #ffffff;
	border: 1px solid #000000;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	font-size: 14px;
	width: 200px;
	z-index: 1000;
`;

export const ModalContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
	padding: 40px;
	animation: ${props => props.$isClosing ? 'fadeOut' : 'fadeIn'} 0.3s ease forwards;

	@keyframes fadeIn {
		from {
			background-color: rgba(0, 0, 0, 0);
		}
		to {
			background-color: rgba(0, 0, 0, 0.5);
		}
	}

	@keyframes fadeOut {
		from {
			background-color: rgba(0, 0, 0, 0.5);
		}
		to {
			background-color: rgba(0, 0, 0, 0);
		}
	}
`;

export const HeaderTitle = styled.h1`
	font-size: 2.5rem;
	color: #333;
	margin-bottom: 2rem;
	text-align: center;
`;

export const Footer = styled.footer`
	position: relative;
	width: 100%;
	height: 10vh;
	background-color: #ffffff;
	border-top: 1px solid #e0e0e0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: 'Noto Serif', serif;
	box-sizing: border-box;
	margin-top: auto;
`;

export const NavHeader = styled.header`
	position: absolute;
	top: 0;
	left: 0;
	width: 100vw;
	max-width: 100%;
	height: 80px;
	background-color: #ffffff;
	border-bottom: 1px solid #e0e0e0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 5%;
	z-index: 1000;
	box-sizing: border-box;
`;

export const HeaderLogo = styled.img`
	height: 50px;
	margin: 0;
	cursor: pointer;
`;

export const MiscButton = styled.button`
	padding: 0.8em 1.5em;
	border: 1px solid #e0e0e0;
	border-radius: 10px;
	background: white;
	cursor: pointer;
	font-family: 'Noto Serif', serif;
	font-weight: bold;
	font-size: 1rem;
	color: #000000;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	
	&:hover {
		background: #f5f5f5;
	}

	${props => props.as === 'a' && `
		text-decoration: none;
	`}
`;

export const PictureLogo = styled.img`
	height: 60px;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	cursor: default;
`;