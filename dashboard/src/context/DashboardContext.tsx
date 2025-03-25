import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { theme } from '../styles/theme';

interface DashboardContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  profileUsername: string;
  isProfileLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { getProfile } = useProfileAPI();
  const [profileUsername, setProfileUsername] = useState<string>('');
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const checkInitialScreenSize = () => {
      const tabletBreakpoint = parseInt(theme.breakpoints.tablet.replace('px', ''));
      setSidebarCollapsed(window.innerWidth <= tabletBreakpoint);
    };
    
    checkInitialScreenSize();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        if (profileData) {
          setProfileUsername(profileData.username || 'User');
        }
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [getProfile]);

  const value: DashboardContextType = {
    isSidebarCollapsed,
    setSidebarCollapsed,
    profileUsername,
    isProfileLoading,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}; 