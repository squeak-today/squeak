import styled from 'styled-components';
import { theme } from '../theme';

export const SubscriptionCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 350px;
  max-width: 350px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 80%;
  }
`;

export const PlanTitle = styled.h3<{ isCustom?: boolean }>`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => props.isCustom ? theme.typography.fontSize.xl : theme.typography.fontSize.lg};
  margin: 0 0 ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  font-weight: bold;
`;

export const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: ${theme.spacing.md};
`;

export const Price = styled.span`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: 3rem;
  font-weight: bold;
  color: ${theme.colors.text.primary};
`;

export const PriceUnit = styled.span`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin-left: ${theme.spacing.sm};
`;

export const AddOnText = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

export const BenefitsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 0;
`;

export const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
`;

export const ActionButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: #f5f5f5;
  color: #000000;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
  
  &:hover {
    background-color: #e8e8e8;
  }
`;

export const PlanInfoTag = styled.span`
  display: inline-block;
  background-color: #e6f2ff;
  color: #3a80d2;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 20px;
  margin-left: ${theme.spacing.md};
`;

export const BillingPeriodRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
`;

export const PlansContainer = styled.div`
  width: 100%;
  display: flex;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  justify-content: flex-start;
  flex-wrap: wrap;
  flex-direction: row;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: center;
  }
`; 