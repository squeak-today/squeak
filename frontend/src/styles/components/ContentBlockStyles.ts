import styled from 'styled-components';
import { theme } from '../theme';
import { getCEFRColor, getCEFRTextColor } from '../../lib/cefr';

interface TagProps {
    cefr?: string;
}

export const ContentBlockContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.25em 1.25em 1em;
  margin: 0;
  cursor: pointer;
  transition: transform 0.2s;
  font-family: ${theme.typography.fontFamily.secondary};
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: ${theme.typography.fontFamily.secondary};

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }
`;

export const DateText = styled.div`
  color: #888;
  font-size: 0.875em;
  text-align: right;
  padding-right: 0.5em;
  font-family: ${theme.typography.fontFamily.secondary};

  @media (max-width: 500px) {
    text-align: left;
    padding-right: 0;
    margin-top: 0.5em;
  }
`;

export const Title = styled.h2`
  margin: 1em 0 0.625em 0;
  font-size: 1.25em;
  color: #333;
  font-family: ${theme.typography.fontFamily.primary};
`;

export const ContentWrapper = styled.div`
  margin-right: 0;
  margin-top: 0.5em;
  margin-bottom: 1.25em;
  padding-right: 0.5em;
  font-family: ${theme.typography.fontFamily.secondary};
`;

export const Preview = styled.p`
  color: #666;
  font-size: 0.875em;
  font-family: ${theme.typography.fontFamily.secondary};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const TagContainer = styled.div`
  display: flex;
  gap: 0.625em;
  font-family: ${theme.typography.fontFamily.secondary};
  flex-wrap: wrap;
`;

export const Tag = styled.span<TagProps>`
  background: ${props => props.cefr ? getCEFRColor(props.cefr) : '#E0E0E0'};
  padding: 0.4em 1em;
  border-radius: 15px;
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => props.cefr ? getCEFRTextColor(props.cefr) : '#333'};
  font-family: ${theme.typography.fontFamily.secondary};
  ${props => props.cefr && 'font-weight: bold;'}
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AcceptButton = styled.button`
  position: absolute;
  bottom: 1em;
  right: 1em;
  background-color: rgba(250, 212, 143, 0.5);
  color: black;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0a700;
  }
`;

export const RejectButton = styled.button`
  position: absolute;
  bottom: 1em;
  right: 1em;
  background-color: rgba(255, 179, 179, 0.5);
  color: black;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  font-family: ${theme.typography.fontFamily.secondary};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff6b6b;
  }
`; 