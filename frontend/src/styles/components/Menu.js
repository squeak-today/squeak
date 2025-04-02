import styled from 'styled-components';
import { theme } from './theme';

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  min-width: 300px;
`;

export const MenuItem = styled.div`
  padding: 1.5rem;
  background: ${props => props.$isActive ? '#fad48f' : 'white'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$isActive ? '#f5c168' : '#e0e0e0'};

  &:hover {
    background: ${props => props.$isActive ? '#fad48f' : '#f5f5f5'};
  }
`;

export const MenuTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.lg};
  margin: 0;
  margin-bottom: 0.5rem;
  color: ${theme.colors.text.primary};
`;

export const MenuDescription = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`; 