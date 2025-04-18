import styled from 'styled-components';
import { theme } from './theme';

interface MainContentProps {
  $isMobile?: boolean;
}

interface MobileNavProps {
  $isOpen: boolean;
}

export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.div<MainContentProps>`
  flex: 1;
  margin-left: ${props => props.$isMobile ? '0' : 'calc(15vw + ' + theme.spacing.md + ' + ' + theme.spacing.md + ')'};
  position: relative;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-top: 70px;
    margin-left: 0;
    width: 100%;
  }
`;

export const MobileNav = styled.div<MobileNavProps>`
  position: fixed;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  background-color: white;
  z-index: 1002;
  padding: ${theme.spacing.lg};
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  box-shadow: ${props => props.$isOpen ? '-5px 0 15px rgba(0, 0, 0, 0.1)' : 'none'};
`;


export const Sidebar = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  width: 15vw;
  min-width: 140px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  z-index: 1001;
`;

export const MobileHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 95%;
  height: 70px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px; /* Increase horizontal padding */
  border-bottom: 1px solid #e0e0e0;
  z-index: 1001;
`;


export const HamburgerIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
  margin-right: 15px; /* Add margin to pull it away from the edge */
  padding: 5px;       /* Add padding to increase the hit area */
  
  span {
    display: block;
    height: 3px;
    width: 100%;
    background-color: ${theme.colors.text.primary};
    border-radius: 3px;
  }
`;


export const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-bottom: ${theme.spacing.md};
`;

export const MobileNavButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  text-align: left;
  background: none;
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: ${theme.colors.text.primary};
  }

  &.active {
    background-color: #f0f0f0;
    color: ${theme.colors.text.primary};
    font-weight: bold;
  }

  &.logout {
    color: #ff4444;
    
    &:hover {
      color: #ff0000;
      background-color: #fff5f5;
    }
  }
`;

export const HeaderLogo = styled.img`
  width: 40px;
  height: 40px;
  cursor: pointer;
  
  @media (min-width: 769px) {
    width: 60px;
    height: 60px;
  }
`;

export const LogoText = styled.span`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  cursor: pointer;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  
  @media (min-width: 769px) {
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
    padding: ${theme.spacing.md} 0;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
  }
`;

export const NavButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  text-align: left;
  background: none;
  border: none;
  border-radius: 8px;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: ${theme.colors.text.primary};
  }

  &.active {
    background-color: #f0f0f0;
    color: ${theme.colors.text.primary};
    font-weight: bold;
  }

  &.logout {
    color: #ff4444;
    
    &:hover {
      color: #ff0000;
      background-color: #fff5f5;
    }
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const LoadingLogo = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
`;

export const LoadingText = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.secondary};
  margin-top: 20px;
`;

export const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid rgb(94, 94, 94);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const DashboardLink = styled.a`
  margin-top: 0;
  margin-bottom: 0;
  padding: 0;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  text-decoration: underline;
  cursor: pointer;
  text-align: center;

  &:hover {
    color: ${theme.colors.text.secondary};
  }
`;

export const MobileDashboardLink = styled.a`
  margin-top: 0;
  padding: 0;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  text-decoration: underline;
  cursor: pointer;
  text-align: center;

  &:hover {
    color: ${theme.colors.text.secondary};
  }
`;

export const PremiumPanel = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: ${theme.elevation.base};
  padding: ${theme.spacing.md};
  margin-top: auto;
  margin-bottom: ${theme.spacing.md};
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 85%;
  width: 85%;
  
  &:hover {
    box-shadow: ${theme.elevation.hover};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    max-width: 90%;
  }
`;

export const PremiumTitle = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
`;

export const PremiumSubtitle = styled.div`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 0.8rem;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

export const PremiumButton = styled.button`
  background: ${theme.colors.selected};
  color: black;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 0.8rem;
  font-weight: 500;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const MobilePremiumPanel = styled(PremiumPanel)`
  margin: ${theme.spacing.md} auto;
  width: 80%;
`;
