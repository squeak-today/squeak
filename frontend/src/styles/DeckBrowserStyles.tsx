import styled from 'styled-components';
import { theme } from './theme';

export const DeckBrowserContainer = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

export const DeckBrowserTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
`;

export const ContentLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing.lg};
  align-items: flex-start;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

export const LoadingText = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  color: ${theme.colors.text.secondary};
`;

export const EmptyStateText = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  color: ${theme.colors.text.secondary};
`;

export const DeckGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${theme.spacing.md};
  flex: 1;
  
  @media (min-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const DeckCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: ${theme.spacing.md};
  box-shadow: ${theme.elevation.base};
  border: 1px solid ${theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.elevation.hover};
  }
`;

export const DeckName = styled.h3`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

export const DeckDescription = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: ${theme.spacing.md};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const DeckStatus = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

export const DeckActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: auto;
  padding-top: ${theme.spacing.md};
`;

export const ViewButton = styled.button`
  padding: 8px 16px;
  background-color: ${theme.colors.selected};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
  
  &:hover {
    background-color: #e0a700;
  }
`;

export const DeleteButton = styled.button`
  padding: 8px 16px;
  background-color: ${theme.colors.danger};
  color: white;
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
  
  &:hover {
    background-color: #c0392b;
  }
`;

export const CreateDeckForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 320px;
  padding: ${theme.spacing.md};
  background-color: white;
  border-radius: 15px;
  box-shadow: ${theme.elevation.base};
  border: 1px solid ${theme.colors.border};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;
  }
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

export const CreateButton = styled.button`
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

export const FormTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;