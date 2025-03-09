import styled from 'styled-components';
import { theme } from '../theme';

export const Container = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  max-width: 80vw;
  margin: 0 auto;
  padding: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    padding: ${theme.spacing.md};
  }
`;