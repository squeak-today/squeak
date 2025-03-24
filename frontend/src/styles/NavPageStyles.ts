import styled from 'styled-components';
import { theme } from './theme';

export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: row;
`;

export const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  padding-left: 30px; // Add extra padding on the left
  overflow-y: auto;
  margin-left: 220px; // Assuming the sidebar width is around 200px, adjust as needed
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

export const HeaderLogo = styled.img`
  width: 60px;
  height: 60px;
  cursor: pointer;
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
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
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
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`; 