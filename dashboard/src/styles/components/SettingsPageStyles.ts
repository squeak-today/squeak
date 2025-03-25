import styled from 'styled-components';
import { theme } from '../theme';

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
`;

export const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  margin: 0 0 ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
`;

export const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
  width: 100%;
`;

export const SectionTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  margin: 0 0 ${theme.spacing.md};
  color: ${theme.colors.text.primary};
`;

export const CurrentPlanContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const PlanName = styled.h3`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  margin: 0;
  color: ${theme.colors.text.primary};
`;

export const CurrentPlanTag = styled.span`
  display: inline-block;
  background-color: #f5f5f5;
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 20px;
  margin-left: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
`;

export const BillingPeriodRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
`;

export const CalendarIcon = styled.span`
  margin-right: ${theme.spacing.sm};
`;