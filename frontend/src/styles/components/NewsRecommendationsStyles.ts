import styled from 'styled-components';
import { theme } from '../theme';

export const Container = styled.div`
  margin-bottom: 2em;
  padding-left: 0;
  padding-right: 1.5em;
  max-width: 90vw;
  margin: 0 auto 2em;
  position: relative;
`;

export const Title = styled.h2`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 0.5em;
  color: ${theme.colors.text.primary};
  margin-left: 0;
`;

export const Subtitle = styled.h3`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 1.1em;
  margin-bottom: 1em;
  color: ${theme.colors.text.secondary};
  font-weight: normal;
  margin-left: 0;
`;

export const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75em;
  position: relative;
  padding-left: 30px;
  margin-top: 1.5em;
  padding-top: 1.5em;
  padding-bottom: 1.5em;
`;

export const Timeline = styled.div`
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: ${theme.colors.border};

  &::before, &::after {
    content: "";
    position: absolute;
    left: 50%;
    width: 14px;
    height: 14px;
    background-color: ${theme.colors.border};
    border-radius: 50%;
    transform: translateX(-50%);
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
  }
`;

export const RecommendationItem = styled.div`
  position: relative;
  margin: 0;

  > div {
    box-shadow: ${theme.elevation.base};
    background: white;
    border-radius: 12px;
    padding: 1.25em;
    margin: 0;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.elevation.hover};
    }
  }

  &:before {
    content: '';
    position: absolute;
    left: -20px;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: ${theme.colors.border};
    transform: translateY(-50%);
  }
`;

export const NoRecommendationsMessage = styled.div`
  text-align: center;
  padding: 1em;
  color: #666;
  font-family: ${theme.typography.fontFamily.primary};
  font-style: italic;
`; 