import styled from 'styled-components';
import {theme} from './theme'

export const DeckViewContainer = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

export const DeckTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
`;

export const DeckDescription = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.base};
`;

export const ActionButton = styled.button`
  background-color: ${props => props.color || '#fad48f'};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  padding: 0.5em 1.5em;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  margin-bottom: ${theme.spacing.lg};
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: ${theme.elevation.base};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.elevation.hover};
  }
`;

export const BackButton = styled.button`
  margin: 20px 0;
  padding: 8px 16px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.primary};
  font-size: 0.9em;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: ${theme.colors.text.secondary};
  }
`;

export const EmptyDeckContainer = styled.div`
  padding: ${theme.spacing.lg};
  background-color: #f8f8f8;
  text-align: center;
  border-radius: 15px;
  box-shadow: ${theme.elevation.base};
  margin-bottom: ${theme.spacing.lg};
`;

export const EmptyDeckText = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily.secondary};
`;

export const FlashcardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const FlashcardItem = styled.div`
  background: white;
  border-radius: 15px;
  padding: ${theme.spacing.md};
  box-shadow: ${theme.elevation.base};
  border: 1px solid ${theme.colors.border};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.elevation.hover};
  }
`;

export const FlashcardFront = styled.p`
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.primary};
`;

export const FlashcardBack = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily.secondary};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

export const EditButton = styled.button`
  padding: 6px 12px;
  background-color: ${theme.colors.selected};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: 6px;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0a700;
  }
`;

export const DeleteButton = styled.button`
  padding: 6px 12px;
  background-color: ${theme.colors.danger};
  color: white;
  border: none;
  border-radius: 6px;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #c0392b;
  }
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  max-width: 500px;
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: white;
  border-radius: 15px;
  box-shadow: ${theme.elevation.base};
  border: 1px solid ${theme.colors.border};
`;

export const FormInput = styled.input`
  padding: 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.selected};
    box-shadow: 0 0 0 2px rgba(250, 212, 143, 0.3);
  }
`;

export const SubmitButton = styled.button`
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #388E3C;
  }
`;

export const CancelButton = styled.button`
  padding: 10px;
  background-color: #9e9e9e;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #757575;
  }
`;