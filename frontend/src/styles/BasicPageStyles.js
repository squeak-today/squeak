import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const LoadingLogo = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
`;

export const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-top: 20px;
  font-family: 'Lora', serif;
`;

export const Spinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid rgb(0, 0, 0);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: ${spin} 1s linear infinite;
`; 