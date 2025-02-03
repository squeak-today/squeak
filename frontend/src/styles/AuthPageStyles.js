import styled from 'styled-components';

export const AuthBox = styled.div`
	width: 100%;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 20px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	margin: 0px auto 0 auto;
	box-sizing: border-box;
`;

export const ToggleButton = styled.button`
  flex: 1;
  position: relative;
  z-index: 1; /* ensures text is above the white slider */
  background: transparent; /* so we can see the slider behind it */
  border: none;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Lora', serif;
  color: ${({ active }) => (active ? '#000000' : '#8f8f8f')};
  transition: color 0.3s ease;

  &:hover {
    color: ${({ active }) => (active ? '#000000' : '#666666')};
  }
`;


export const ToggleContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 60%;
  height: 36px;
  margin: 0 auto 20px auto;
  background: #f5f5f5;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const Slider = styled.div`
  position: absolute;
  top: 0;
  left: ${({ isLogin }) => (isLogin ? '50%' : '0%')};
  width: 50%;
  height: 100%;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
`;

export const AuthTitle = styled.h2`
  font-family: 'Lora', serif;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 400;
  text-align: center;
`;


export const AuthContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
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
	background:rgb(255, 255, 255);
	cursor: pointer;
	color: black;
	font-family: 'Lora', serif;
	font-size: 16px;
	transition: all 0.2s ease;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	box-sizing: border-box;

	&:hover {
		background:rgb(228, 228, 228);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	&:disabled {
		background: #fad48f;
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

export const AuthText = styled.p`
	text-align: center;
	font-family: 'Noto Serif', serif;
	margin: 0.5rem 0;
`;