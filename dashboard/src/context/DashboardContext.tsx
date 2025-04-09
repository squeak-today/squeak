import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { components } from '../lib/clients/types';
import { theme } from '../styles/theme';
import { useAuth } from './AuthContext';

type ClassroomListItem = components['schemas']['models.ClassroomListItem'];

interface DashboardContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  profileUsername: string;
  isProfileLoading: boolean;
  classrooms: ClassroomListItem[];
  selectedClassroom: string;
  setSelectedClassroom: (classroom_id: string) => void;
  fetchClassrooms: () => Promise<void>;
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
  const { getClassroomList } = useTeacherAPI();
  const { jwtToken } = useAuth();
  const [profileUsername, setProfileUsername] = useState<string>('');
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<ClassroomListItem[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  useEffect(() => {
    const checkInitialScreenSize = () => {
      const tabletBreakpoint = parseInt(theme.breakpoints.tablet.replace('px', ''));
      setSidebarCollapsed(window.innerWidth <= tabletBreakpoint);
    };
    
    checkInitialScreenSize();
  }, []);

  const fetchClassrooms = useCallback(async () => {
    const classroomsData = await getClassroomList();
    console.log(classroomsData);
    setClassrooms(classroomsData.classrooms);
    
    if (classroomsData.classrooms && classroomsData.classrooms.length > 0) {
      const currentSelectionExists = classroomsData.classrooms.some(
        (classroom: ClassroomListItem) => classroom.classroom_id === selectedClassroom
      );
      
      if (!currentSelectionExists) {
        setSelectedClassroom(classroomsData.classrooms[0].classroom_id);
      }
    }
  }, [getClassroomList, selectedClassroom]);

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

    if (jwtToken) {
      fetchProfile();
      fetchClassrooms();
    }
  }, [jwtToken]);

  const value: DashboardContextType = {
    isSidebarCollapsed,
    setSidebarCollapsed,
    profileUsername,
    isProfileLoading,
    classrooms,
    selectedClassroom,
    setSelectedClassroom,
    fetchClassrooms,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}; 