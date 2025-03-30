import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useStudentAPI } from '../hooks/useStudentAPI';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useAuth } from './AuthContext';

interface PlatformContextType {
  isTeacher: boolean;
  isStudent: boolean;
  isLoading: boolean;
  checkRoles: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

interface PlatformProviderProps {
  children: ReactNode;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  const { jwtToken } = useAuth();
  const { verifyTeacher } = useTeacherAPI();
  const { getStudentStatus } = useStudentAPI();
  
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkRoles = async () => {
    if (!jwtToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      try {
        const response = await verifyTeacher();
        if (response.exists) {
          setIsTeacher(true);
        } else {
          setIsTeacher(false);
        }
      } catch (error) {
        setIsTeacher(false);
      }

      try {
        const response = await getStudentStatus();
        if (response.student_id !== '') {
          setIsStudent(true);
        } else {
          setIsStudent(false);
        }
      } catch (error) {
        setIsStudent(false);
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkRoles();
  }, [jwtToken]);

  const value: PlatformContextType = {
    isTeacher,
    isStudent,
    isLoading,
    checkRoles
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}; 