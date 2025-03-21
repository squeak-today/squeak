import styled from 'styled-components';
import { theme } from './theme';

export const BrowserBox = styled.div`
  width: 100%;
  height: 100%;
  margin: 2em auto 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 40px auto 0 auto;
    padding: 1em;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

interface TabProps {
  isActive?: boolean;
}

export const Tab = styled.button<TabProps>`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  color: ${theme.colors.text.primary};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.isActive ? theme.colors.text.primary : 'transparent'};
    transition: background-color 0.3s ease;
  }
`;

export const GreetingHeader = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: bold;
  text-align: left;
  margin-bottom: 0.5em;
  color: ${theme.colors.text.primary};
`;

export const LearnPageLayout = styled.div`
  display: flex;
  gap: 1em;
  width: 100%;
  height: 100%;
  padding: 0 1em;
  box-sizing: border-box;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    padding: 0;
  }
`;

export const StoryBrowserContainer = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 60vw;
`;

export const ProfileDashboardContainer = styled.div`
  width: 300px;
  min-width: 300px;
  max-width: 80%;
  background: white;
  border-radius: 15px;
  padding: 2em;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  height: fit-content;
  font-family: ${theme.typography.fontFamily.primary};
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    margin: 0 0 1em 0;
    padding: 1.5em;
    align-self: center;
  }
`;

export const DateHeader = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  text-align: center;
  margin-bottom: 1em;
  font-size: 2em;
  font-weight: 600;
`;

export const NoRecommendationsMessage = styled.div`
  text-align: center;
  padding: 1em;
  color: #666;
  font-family: ${theme.typography.fontFamily.primary};
  font-style: italic;
`; 