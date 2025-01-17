import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
	from {
		transform: translateY(-100%);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
`;

const fadeOut = keyframes`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`;

export const NotificationsWrapper = styled.div`
	position: fixed;
	top: 20px;
	left: 50%;
	transform: translate(-50%, 0);
	z-index: 1000;
	display: flex;
	flex-direction: column;
	gap: 10px;
	pointer-events: none;
	align-items: center;
`;

export const NotificationContainer = styled.div`
	background-color: ${props => props.$type === 'error' ? '#ffb3b3' : '#b8e6b8'};
	color: ${props => props.$type === 'error' ? '#800000' : '#006400'};
	padding: 0.7rem 1.5rem;
	border-radius: 4px;
	box-shadow: 0 2px 5px rgba(0,0,0,0.1);
	max-width: 300px;
	animation: ${props => props.$isLeaving ? fadeOut : slideIn} 0.3s ease-in-out forwards;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 500;
	min-height: 20px;
	pointer-events: auto;
`;