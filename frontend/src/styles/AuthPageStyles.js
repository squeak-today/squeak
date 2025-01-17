import styled from 'styled-components';

const AuthContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	width: 90%;
	max-width: 24rem;
	margin: 0 auto;
	padding: 2rem;
	background: white;
	border-radius: 10px;
	border: 1px solid #e0e0e0;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AuthForm = styled.form`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: center;
`;

const AuthInput = styled.input`
	width: 100%;
	padding: 0.5em;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	font-family: 'Noto Serif', serif;
	font-size: 16px;
	background: white;
	transition: border-color 0.2s ease, box-shadow 0.2s ease;
	box-sizing: border-box;

	&:focus {
		outline: none;
		border-color: #666;
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
	}

	&::placeholder {
		color: #999;
	}
`;

const AuthButton = styled.button`
	width: 100%;
	padding: 0.5em 1em;
	border: 1px solid #e0e0e0;
	border-radius: 10px;
	background: white;
	cursor: pointer;
	font-family: 'Noto Serif', serif;
	font-size: 16px;
	transition: all 0.2s ease;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	box-sizing: border-box;

	&:hover {
		background: #f5f5f5;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	&:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
		opacity: 0.7;
	}
`;

const AuthToggle = styled.button`
	background: none;
	border: none;
	color: #333;
	text-decoration: underline;
	cursor: pointer;
	font-family: 'Noto Serif', serif;
	margin-top: 1rem;
	padding: 0.5em 1em;
	font-size: 16px;
	transition: color 0.2s ease;

	&:hover {
		color: #666;
	}
`;

export { AuthContainer, AuthForm, AuthInput, AuthButton, AuthToggle };