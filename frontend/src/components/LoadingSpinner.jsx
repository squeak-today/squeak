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
    width: ${props => props.size || '40px'};
    height: ${props => props.size || '40px'};
    border: ${props => props.borderWidth || '4px'} solid #f3f3f3;
    border-top: ${props => props.borderWidth || '4px'} solid #5c5b5b;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = ({ size = "40px", borderWidth = "4px" }) => (
    <SpinnerContainer>
        <Spinner size={size} borderWidth={borderWidth} />
    </SpinnerContainer>
);

const InlineSpinnerComponent = ({ size = "40px", borderWidth = "4px" }) => (
    <Spinner 
        size={size} 
        borderWidth={borderWidth} 
        style={{ display: 'inline-block', margin: 0 }}
    />
);

export { InlineSpinnerComponent as InlineSpinner };
export default LoadingSpinner; 