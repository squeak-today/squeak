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

export const CurrentPlanTag = styled.span<{ canceled?: boolean }>`
  display: inline-block;
  background-color: ${props => props.canceled ? theme.colors.dangerbg : '#f5f5f5'};
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

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: ${theme.spacing.lg};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

export const ModalMessage = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.md};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

export const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
`;

export const ModalTitle = styled.h3`
  text-align: center;
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
`;

export const ModalButton = styled.button<{ bgColor?: string; textColor?: string }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 4px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  border: none;
  background-color: ${props => props.bgColor || '#f5f5f5'};
  color: ${props => props.textColor || theme.colors.text.primary};
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const CancelPlanButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  
  &:hover {
    opacity: 0.9;
  }
`;