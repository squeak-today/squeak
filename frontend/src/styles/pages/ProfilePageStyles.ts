import styled from 'styled-components';
import { theme } from '../theme';


export const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0;
    width: 100%;
  }
`

export const ProfileContainer = styled.div<{ $width?: string }>`
  padding: ${theme.spacing.lg};
  max-width: 800px;
  width: ${props => props.$width || '50%'};
  margin: 0 auto;
  font-family: ${theme.typography.fontFamily.secondary};
  box-sizing: border-box;
  justify-content: center;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 90%;
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

export const BillingContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.elevation.base};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  
  &:hover {
    box-shadow: ${theme.elevation.hover};
  }
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
    width: 90%;
  }
`;

export const PremiumTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

export const PremiumSubtitle = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  max-width: 90%;
`;

export const PremiumButton = styled.button`
  background: ${theme.colors.selected};
  color: black;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: 500;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  max-width: 100%;
  white-space: normal;
  text-align: center;
  word-wrap: break-word;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
  }
`;

export const SubscriptionHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const SubscriptionTitle = styled.h1<{ $fontSize?: string }>`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => (props.$fontSize == 'lg' ? theme.typography.fontSize.lg : theme.typography.fontSize.xl)};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const CancelSubscriptionTitle = styled(SubscriptionTitle)`
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: 0;
`;

export const SubscriptionPlansContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

export const ConfirmationContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

export const ConfirmationText = styled.p`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
`;

export const CancelSubscriptionText = styled(ConfirmationText)`
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: 0;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  background: ${props => {
    switch (props.$variant) {
      case 'danger': return theme.colors.danger;
      case 'secondary': return 'transparent';
      default: return theme.colors.selected;
    }
  }};
  color: ${props => props.$variant === 'secondary' ? theme.colors.text.primary : 'black'};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: 500;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: ${props => props.$variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  
  &:hover {
    opacity: 0.9;
    box-shadow: ${theme.elevation.base};
  }
`;

export const PlanValue = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  font-style: italic;
  font-weight: 500;
`;

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
  border-radius: 12px;
  font-weight: normal;
`;

export const UsageLimitContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${theme.spacing.md};
`;

export const UsageLimitTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.md} 0;
  text-align: left;
`;

export const UsageLimitItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: ${theme.spacing.md};
`;

export const UsageLimitLabel = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  text-align: left;
`;

export const UsageLimitBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

export const UsageLimitBarWrapper = styled.div`
  position: relative;
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

export const UsageLimitBarFill = styled.div<{ $percentage: number; $atLimit: boolean }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background-color: ${props => props.$atLimit ? theme.colors.danger : '#4CAF50'};
  transition: width 0.3s ease-in-out;
`;

export const UsageLimitValue = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: 500;
  color: ${theme.colors.text.secondary};
  min-width: 40px;
  text-align: right;
`;

export const UsageLimitUnlimited = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: 500;
  color: ${theme.colors.text.secondary};
  font-style: italic;
  text-align: right;
  min-width: 70px;
`;