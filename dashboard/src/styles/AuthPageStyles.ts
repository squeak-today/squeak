import styled from 'styled-components';
import { theme } from './theme';

export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.background};
  position: relative;
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

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
`;

export const AuthInput = styled.input`
  padding: ${theme.spacing.md};
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: #aaa;
  }
`;

export const AuthButton = styled.button`
  padding: ${theme.spacing.md};
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #555;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const AuthToggle = styled.div`
  text-align: center;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const HintText = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 0.9rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
  background-color: #f9f9f9;
  padding: ${theme.spacing.md};
  border-radius: 8px;
  border: 1px dashed ${theme.colors.border};
`;