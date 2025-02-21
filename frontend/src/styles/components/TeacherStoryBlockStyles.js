import styled from 'styled-components';

import {
  StoryBlockContainer as BaseStoryBlockContainer,
  TopSection,
  DateText,
  Title,
  ContentWrapper,
  Preview,
  TagContainer,
  Tag,
  getCEFRColor
} from './StoryBlockStyles';

export {
  TopSection,
  DateText,
  Title,
  ContentWrapper,
  Preview,
  TagContainer,
  Tag,
  getCEFRColor
};

export const StoryBlockContainer = styled(BaseStoryBlockContainer)`
  padding-bottom: 1.5em;
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
  font-family: 'Lora', serif;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0a700;
  }
`; 