import styled from 'styled-components';
import { theme } from './theme';

export const AnalyticsPageContainer = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${theme.colors.background};
  font-family: ${theme.typography.fontFamily.secondary};
`;

export const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

export const WidgetRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const StyledWidget = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.elevation.base};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${theme.elevation.hover};
  }
`;

export const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};

  h3 {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.text.primary};
    margin: 0;
  }

  svg {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const MetricValue = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.primary};
  margin: ${theme.spacing.md} 0;
`;

interface PercentageIndicatorProps {
  $value: number;
}

export const PercentageIndicator = styled.span<PercentageIndicatorProps>`
  color: ${props => props.$value >= 80 ? theme.colors.cefr.beginner.text :
    props.$value >= 60 ? theme.colors.cefr.intermediate.text :
    theme.colors.cefr.advanced.text};
  font-weight: 600;
`;

export const ProblemItem = styled.div`
  padding: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  background-color: ${theme.colors.cefr.advanced.bg};
  border-radius: 4px;
  border-left: 4px solid ${theme.colors.cefr.advanced.text};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const ProblemRank = styled.span`
  font-weight: 600;
  color: ${theme.colors.text.primary};
  min-width: 40px;
`;

export const DateHeader = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  color: ${theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: ${theme.spacing.lg};
  text-align: right;
`;

export const ChartContainer = styled.div`
  margin-top: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  padding: ${theme.spacing.sm};
`;