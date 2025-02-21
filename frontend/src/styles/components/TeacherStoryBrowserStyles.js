import {
  FilterContainer,
  FilterLabel,
  FilterSelect,
  PaginationContainer,
  PageButton,
  DisclaimerText,
  NoContentMessage
} from './StoryBrowserStyles';

import styled from 'styled-components';

export {
  FilterLabel,
  FilterSelect,
  PaginationContainer,
  PageButton,
  DisclaimerText,
  NoContentMessage
};

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5em;
`;

export const Header = styled.h1`
  font-family: 'Lora', serif;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1.5em;
  color: #000;
`;

export const TeacherFilterContainer = styled(FilterContainer)`
  padding: 0 1.5em;
  
  @media (max-width: 800px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }
`; 