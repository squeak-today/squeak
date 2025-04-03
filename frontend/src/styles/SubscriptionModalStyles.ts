import styled, { keyframes } from 'styled-components';
import { theme } from './theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const ModalContainer = styled.div<{ $width?: string }>`
  background-color: white;
  border-radius: 16px;
  box-shadow: ${theme.elevation.hover};
  padding: ${theme.spacing.lg};
  position: relative;
  width: ${props => props.$width || '90%'};
  max-width: 80vw;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease-out;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 95%;
    padding: ${theme.spacing.md};
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: none;
  border: none;
  cursor: pointer;
  width: 16px;
  height: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
  }
`;

export const ModalContent = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
`; 