import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useStudentAPI } from '../hooks/useStudentAPI';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useAuth } from './AuthContext';
import { useBillingAPI } from '../hooks/useBillingAPI';

interface PlatformContextType {
  isTeacher: boolean;
  isStudent: boolean;
  isLoading: boolean;
  plan: string;
  organizationPlan: OrganizationPlan;
  checkRoles: () => Promise<void>;
  checkPlan: () => Promise<void>;
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

type OrganizationPlan = 'NO_ORGANIZATION' | 'FREE' | 'CLASSROOM';

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  const { jwtToken } = useAuth();
  const { verifyTeacher } = useTeacherAPI();
  const { getStudentStatus } = useStudentAPI();
  const { getBillingAccount } = useBillingAPI();

  const [plan, setPlan] = useState<string>('FREE');
  const [organizationPlan, setOrganizationPlan] = useState<OrganizationPlan>('NO_ORGANIZATION');
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
          if (response.plan !== '') {
            setOrganizationPlan(response.plan as OrganizationPlan);
          } else {
            setOrganizationPlan('NO_ORGANIZATION');
          }
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
          if (response.plan !== '') {
            setOrganizationPlan(response.plan as OrganizationPlan);
          } else {
            setOrganizationPlan('NO_ORGANIZATION');
          }
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

  const checkPlan = async () => {
    if (!jwtToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getBillingAccount();
      if (response.data?.plan) {
        setPlan(response.data.plan);
      }
    } catch (error) {
      console.error('Error checking user plan:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkRoles();
    checkPlan();
  }, [jwtToken]);

  const value: PlatformContextType = {
    isTeacher,
    isStudent,
    isLoading,
    plan,
    organizationPlan,
    checkRoles,
    checkPlan
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}; 