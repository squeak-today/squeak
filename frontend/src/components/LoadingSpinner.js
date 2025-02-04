import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #5c5b5b;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = () => (
    <SpinnerContainer>
        <Spinner />
    </SpinnerContainer>
);

export default LoadingSpinner; 