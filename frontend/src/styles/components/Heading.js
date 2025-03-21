import styled from 'styled-components';
import { theme } from 'shared';

export const Heading = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: 400;
  color: ${theme.colors.text.primary};
  line-height: 1.15;
  text-align: left;
  white-space: normal;
  margin: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    text-align: center;
  }
`;

