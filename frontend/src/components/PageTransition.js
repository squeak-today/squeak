import styled, { keyframes } from 'styled-components';

const fadeOut = keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
`;

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

export const TransitionWrapper = styled.div`
    animation: ${props => props.$isLeaving ? fadeOut : fadeIn} 1.0s ease-in-out;
`; 