import styled from 'styled-components';
import { theme } from '../theme';

export const PlanSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  margin-bottom: ${theme.spacing.md};
`;

export const PlanSectionTitle = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

export const PlanName = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: 500;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

export const CanceledTag = styled.span`
  background-color: ${theme.colors.danger};
  color: white;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin-left: ${theme.spacing.md};
  border-radius: 16px;
  font-weight: normal;
`; 