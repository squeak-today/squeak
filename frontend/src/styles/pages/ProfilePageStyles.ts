import styled from 'styled-components';
import { theme } from '../theme';

export const ProfileContainer = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
  font-family: ${theme.typography.fontFamily.secondary};
  box-sizing: border-box;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.md} ${theme.spacing.sm};
  }
`;

export const SubTitle = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const UsernameSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  max-width: 75%;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    max-width: 100%;
    margin-bottom: ${theme.spacing.sm};
  }
`;

export const Username = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: 500;
  color: ${theme.colors.text.primary};
  margin: 0;
  word-break: break-word;
  max-width: 100%;

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

export const UsernameInput = styled.input`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: 500;
  color: ${theme.colors.text.primary};
  border: none;
  border-bottom: 2px solid ${theme.colors.text.secondary};
  background: transparent;
  padding: ${theme.spacing.sm};
  width: 300px;
  max-width: 100%;
  &:focus {
    outline: none;
  }
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 220px;
    font-size: ${theme.typography.fontSize.xl};
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 100%;
    max-width: 100%;
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const EditButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    margin-top: ${theme.spacing.md};
  }
`;

export const EditButton = styled.button<{ $disabled?: boolean }>`
  background: none;
  border: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  color: ${props => props.$disabled ? theme.colors.border : theme.colors.text.secondary};
  padding: ${theme.spacing.sm};
  transition: color 0.2s;
  font-family: ${theme.typography.fontFamily.secondary};
  &:hover {
    color: ${props => props.$disabled ? theme.colors.border : theme.colors.text.primary};
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.md};
    font-size: 1.2rem;
  }
`;

export const MainSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  width: 100%;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
  }
`;

export const FormRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

export const FormColumn = styled.div`
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-bottom: ${theme.spacing.md};
    width: 100%;
  }
`;

export const ProfileSection = styled.div`
  flex: 1;
  min-width: 0;
  background: white;
  border-radius: 16px;
  padding: ${theme.spacing.md};
  box-shadow: ${theme.elevation.base};
  margin-bottom: ${theme.spacing.md};
  
  &:hover {
    box-shadow: ${theme.elevation.hover};
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.sm};
    width: 100%;
  }
`;

export const ProfileLabel = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

export const LanguageText = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: 500;
  color: ${theme.colors.text.primary};
`;

export const Tag = styled.span<{ $type?: string; $color?: string }>`
  background: ${props => {
    if (props.$type === 'cefr') return props.$color;
    if (props.$type === 'teacher') return theme.colors.cefr.beginner.bg;
    return '#f0f0f0';
  }};
  color: ${props => props.$type === 'teacher' ? theme.colors.cefr.beginner.text : theme.colors.text.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 15px;
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.secondary};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.sm} ${theme.spacing.sm};
    font-size: 0.85rem;
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  width: 100%;
`;

export const Select = styled.select`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 15px;
  border: 1px solid ${theme.colors.border};
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.sm};
  }
`;

export const ProgressBarContainer = styled.div`
  width: 80%;
  height: 12px;
  background: ${theme.colors.border};
  border-radius: 6px;
  margin: ${theme.spacing.md} auto 0;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{ $completed: boolean; $percentage: number }>`
  height: 100%;
  background: ${props => props.$completed ? theme.colors.streak.short : '#FFB6C1'};
  width: ${props => Math.min(props.$percentage, 100)}%;
  transition: width 0.3s ease-in-out;
`;

export const ProgressText = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
`;

export const StatValue = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: ${theme.spacing.sm};
`;

export const StatLabel = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
`;

export const GoalAdjuster = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    gap: ${theme.spacing.sm};
  }
`;

export const ActionButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${props => props.$disabled ? theme.colors.border : 'white'};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${props => props.$disabled ? theme.colors.text.secondary : theme.colors.text.primary};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-bottom: ${theme.spacing.md};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: ${props => props.$disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$disabled ? 'none' : theme.elevation.hover};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  }

  &:disabled {
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

export const StreakContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

export const StreakValue = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const StreakLabel = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  font-weight: 500;
`;

export const StreakMessage = styled.div`
  background: ${theme.colors.cefr.beginner.bg};
  color: ${theme.colors.cefr.beginner.text};
  padding: ${theme.spacing.sm} ${theme.spacing.sm};
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

export const BannerContainer = styled.div`
  width: 100%;
  height: 40vh;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.elevation.base};
  
  &:hover {
    box-shadow: ${theme.elevation.hover};
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    height: 30vh;
    margin-bottom: ${theme.spacing.md};
  }
`;

export const BannerFlag = styled.img`
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  height: 45%;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: ${theme.elevation.base};
`;

export const BannerOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    padding: ${theme.spacing.sm};
  }
`; 