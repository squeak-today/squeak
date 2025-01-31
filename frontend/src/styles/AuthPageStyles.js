import styled from 'styled-components';

export const AuthBox = styled.div`
	width: 100%;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 20px;
	margin: 0px auto 0 auto;
	box-sizing: border-box;
`;

export const AuthContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	width: 90%;
	max-width: 24rem;
	padding: 2rem;
	background: white;
	border-radius: 10px;
	border: 1px solid #e0e0e0;
`;

export const AuthForm = styled.form`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: center;
`;

export const AuthInput = styled.input`
	width: 100%;
	padding: 0.5em;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	font-family: 'Lora', serif;
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

export const AuthButton = styled.button`
	width: 100%;
	padding: 0.5em 1em;
	border: 1px solid #e0e0e0;
	border-radius: 10px;
	background: white;
	cursor: pointer;
	color: black;
	font-family: 'Lora', serif;
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

export const AuthToggle = styled.button`
	background: none;
	border: none;
	color: #333;
	text-decoration: underline;
	cursor: pointer;
	font-family: 'Lora', serif;
	margin-top: 1rem;
	padding: 0.5em 1em;
	font-size: 16px;
	transition: color 0.2s ease;

	&:hover {
		color: #666;
	}
`;