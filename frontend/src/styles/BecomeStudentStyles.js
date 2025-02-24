import styled from 'styled-components';

export const ClassroomInput = styled.input`
	width: 100%;
	padding: 0.75rem;
	margin: 0.5rem 0 1.5rem;
	border: 1px solid #e0e0e0;
	border-radius: 6px;
	font-family: 'Lora', serif;
	font-size: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

	&:focus {
		outline: none;
		border-color: #fad48f;
		box-shadow: 0 0 0 2px rgba(250, 212, 143, 0.2);
	}

	&::placeholder {
		color: #999;
	}
`;