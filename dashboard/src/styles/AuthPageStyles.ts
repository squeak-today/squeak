import styled from 'styled-components';
import { theme } from './theme';

export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

export const AuthBox = styled.div`
  background: white;
  padding: ${theme.spacing.xl};
  border-radius: 12px;
  box-shadow: ${theme.elevation.base};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  text-align: center;
  margin: 0;
  color: ${theme.colors.text.primary};
`;

export const Button = styled.button`
  padding: ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  background: white;
  border: 2px solid ${theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${theme.elevation.hover};
    background: ${theme.colors.background};
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`; 