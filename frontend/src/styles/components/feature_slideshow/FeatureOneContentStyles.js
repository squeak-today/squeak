import styled from 'styled-components';
import { theme } from '../../theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
`;

export const Subtitle = styled.h3`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: 500;
  margin-bottom: ${theme.spacing.md};
`;

export const LevelsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 600px;
  font-family: ${theme.typography.fontFamily.secondary};
`;

export const LevelRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const Level = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 20px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-weight: 600;
  font-size: ${theme.typography.fontSize.base};
  min-width: 45px;
  text-align: center;
  background-color: ${({ cefr }) => {
    if (cefr === 'A1' || cefr === 'A2') return theme.colors.cefr.beginner.bg;
    if (cefr === 'B1' || cefr === 'B2') return theme.colors.cefr.intermediate.bg;
    return theme.colors.cefr.advanced.bg;
  }};
  color: ${({ cefr }) => {
    if (cefr === 'A1' || cefr === 'A2') return theme.colors.cefr.beginner.text;
    if (cefr === 'B1' || cefr === 'B2') return theme.colors.cefr.intermediate.text;
    return theme.colors.cefr.advanced.text;
  }};
`;

export const LevelInfo = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
`;

export const Example = styled.span`
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-style: italic;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  min-width: 0;
`; 