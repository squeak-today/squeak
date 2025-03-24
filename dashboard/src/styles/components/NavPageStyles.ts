import styled, { keyframes } from 'styled-components';
import { theme } from '../theme';

export const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: ${theme.colors.background};
`;

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = styled.nav<SidebarProps>`
  display: flex;
  flex-direction: column;
  width: ${props => props.collapsed ? '60px' : '220px'};
  background-color: ${theme.colors.background};
  padding: ${props => props.collapsed ? `${theme.spacing.md} 0` : `${theme.spacing.md} 0`};
  border-right: 1px solid ${theme.colors.border};
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: ${props => props.collapsed ? '60px' : '220px'};
  }
`;

export const ToggleButton = styled.button`
  position: absolute;
  top: 16px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  z-index: 10;
  padding: 0;
  
  &:hover {
    background-color: ${theme.colors.selected};
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

export const ProfileWrapper = styled.div<SidebarProps>`
  position: relative;
  margin-bottom: 0;
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${props => props.collapsed ? '20px' : '8px'};
  padding-top: ${props => props.collapsed ? '0' : '0'};
  min-height: ${props => props.collapsed ? '40px' : 'auto'};
  margin-bottom: ${theme.spacing.md};
`;

export const ProfileContainer = styled.button<SidebarProps>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  width: 100%;
  padding: ${props => props.collapsed ? '8px' : theme.spacing.md};
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: ${props => props.collapsed ? '0' : '0'};
  transition: background-color 0.2s ease;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  position: relative;
  
  &:hover {
    background-color: ${theme.colors.selected};
  }
`;

export const ProfileIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: ${theme.spacing.sm};
`;

export const UserName = styled.span<SidebarProps>`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: bold;
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${props => props.collapsed ? 0 : 1};
  display: ${props => props.collapsed ? 'none' : 'block'};
`;

export const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  width: 100%;
  background-color: ${theme.colors.background};
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 20;
  overflow: hidden;
  max-height: ${props => props.isOpen ? '400px' : '0'};
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: max-height 0.3s ease, opacity 0.2s ease;
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
`;

export const DropdownHeader = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const DropdownTitle = styled.span`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: bold;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  display: block;
  word-break: break-word;
`;

export const DropdownSubtitle = styled.span`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  display: block;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const ClassroomsList = styled.div<{ isExpanded: boolean }>`
  max-height: ${props => props.isExpanded ? '200px' : '0'};
  opacity: ${props => props.isExpanded ? 1 : 0};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
`;

export const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: none;
  border: none;
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${theme.colors.selected};
  }
`;

export const DropdownDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${theme.colors.border};
  margin: ${theme.spacing.sm} 0;
`;

export const NavButton = styled.button<SidebarProps>`
  background: none;
  border: none;
  padding: ${theme.spacing.sm} ${props => props.collapsed ? theme.spacing.sm : theme.spacing.md};
  text-align: ${props => props.collapsed ? 'center' : 'left'};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 2px ${props => props.collapsed ? '5px' : theme.spacing.md};
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};

  img {
    width: 16px;
    height: 16px;
    margin-right: ${props => props.collapsed ? '0' : theme.spacing.sm};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: ${theme.colors.selected};
    color: ${theme.colors.text.primary};
    font-weight: bold;
  }

  &.logout {
    margin-top: auto;
    color: ${theme.colors.danger};

    img {
      filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
    }
  }
`;

export const ContactButton = styled.a<SidebarProps>`
  background: none;
  border: none;
  padding: ${theme.spacing.md} ${props => props.collapsed ? theme.spacing.sm : theme.spacing.lg};
  text-align: ${props => props.collapsed ? 'center' : 'left'};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.base};
  text-decoration: underline;
  cursor: pointer;
  margin: ${theme.spacing.sm} ${props => props.collapsed ? '5px' : theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: ${theme.spacing.lg};
  overflow-y: auto;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const LoadingLogo = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: ${theme.spacing.lg};
`;

export const LoadingText = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  margin-top: ${theme.spacing.md};
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${theme.colors.text.primary};
  animation: ${spin} 1s linear infinite;
`;