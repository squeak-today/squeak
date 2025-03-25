import styled from 'styled-components';
import { theme } from '../theme';

interface TabProps {
  isActive: boolean;
}

export const TabContainer = styled.div`
  display: flex;
  margin-bottom: ${theme.spacing.md};
  width: 100%;
`;

export const Tab = styled.button<TabProps>`
  padding: ${theme.spacing.sm} 0;
  margin-right: ${theme.spacing.lg};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  color: ${theme.colors.text.primary};
  background: none;
  border: none;
  border-bottom: ${props => props.isActive ? `2px solid ${theme.colors.text.primary}` : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  bottom: -1px;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const TabContent = styled.div`
  width: 100%;
  padding-top: ${theme.spacing.md};
`; 