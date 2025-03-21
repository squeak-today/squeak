import styled from 'styled-components';
import { theme } from '../theme';

export const FAQContainer = styled.div`
  width: 70vw;
  max-width: 70vw;
  margin-top: ${theme.spacing.lg};
`;

export const FAQItem = styled.div`
  margin-bottom: ${theme.spacing.md};
  background: white;
  border-radius: 12px;
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.elevation.base};
  transition: all 0.3s ease-in-out;
`;

export const QuestionButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  text-align: left;
  transition: color 0.2s ease;
  min-height: 3.5rem;

  &:hover {
    color: ${theme.colors.text.secondary};
  }
`;

export const Answer = styled.div`
  padding: ${props => (props.$isOpen ? '1.0rem 1.5rem' : '0')};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  line-height: 1.6;
  max-height: ${props => (props.$isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  opacity: ${props => (props.$isOpen ? '1' : '0')};
`;

export const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
`;

export const ContactContainer = styled.div`
  margin-top: ${theme.spacing.sm};
  text-align: center;
  font-family: ${theme.typography.fontFamily.primary};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.md};
`;

export const ContactLink = styled.span`
  text-decoration: underline;
  cursor: pointer;
  color: ${theme.colors.text.primary};
  
  &:hover {
    color: ${theme.colors.text.secondary};
  }
`; 