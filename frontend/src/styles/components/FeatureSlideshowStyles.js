import styled from 'styled-components';
import { Container as BaseContainer } from '../layout/Container';
import { theme } from '../theme';

export const Container = styled(BaseContainer)`
  width: 100vw;
  margin: ${theme.spacing.xl};
  background-color: ${theme.colors.background};
  border-radius: 20px;
  padding: ${theme.spacing.xl};
`;

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
  transition: all 0.4s ease-in-out;
  border: 1px solid ${props => props.$isActive ? '#f5c168' : theme.colors.border};
  box-shadow: ${props => props.$isActive ? theme.elevation.hover : theme.elevation.base};

  &:hover {
    background: ${props => props.$isActive ? '#fad48f' : '#f5f5f5'};
    box-shadow: ${theme.elevation.hover};
    transform: translateY(-2px);
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    ${props => props.$isActive && `
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};
    `}
  }
`;

export const MenuTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  margin: 0;
  color: ${theme.colors.text.primary};
`;

export const MenuDescription = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  height: ${props => props.$isActive ? 'auto' : '0'};
  opacity: ${props => props.$isActive ? '1' : '0'};
  overflow: hidden;
  transition: all 0.4s ease-in-out;
  margin-top: ${props => props.$isActive ? theme.spacing.sm : '0'};
`;

export const ContentArea = styled.div`
  width: 90%;
  padding: ${theme.spacing.md};
  background: white;
  border-radius: 12px;
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.elevation.base};

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const InlineContentArea = styled(ContentArea)`
  display: none;
  box-shadow: none;
  border: none;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: ${props => props.$isActive ? 'block' : 'none'};
    margin-top: ${theme.spacing.md};
  }
`; 