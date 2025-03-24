import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useNotification } from '../context/NotificationContext';
import NavPage from '../components/NavPage';
import TeacherStudentProfiles from '../components/TeacherStudentProfile';
import {
  Section,
  DateHeader,
} from '../styles/TeacherDashboardPageStyles';
import { styled } from 'styled-components';

const StudentsContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

interface StudentProfile {
  id: string;
  name: string;
}

interface StudentProfilesData {
  profiles: StudentProfile[];
}

function TeacherStudents() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [studentProfiles, setStudentProfiles] = useState<StudentProfilesData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const {
    isAuthenticated,
    verifyTeacher,
    getStudentProfiles,
    removeStudent,
  } = useTeacherAPI();

  const handleRemoveStudent = async (userId: string) => {
    try {
      await removeStudent(userId);
      const updatedProfiles = await getStudentProfiles();
      setStudentProfiles(updatedProfiles);
      showNotification('Student removed successfully');
    } catch (error) {
      console.error('Failed to remove student:', error);
      showNotification('Failed to remove student. Please try again.');
    }
  };

  useEffect(() => {
    if (!isInitializing) return;
    const init = async () => {
      try {
        if (isAuthenticated) {
          const data = await verifyTeacher();
          if (data.exists) {
            const profilesData = await getStudentProfiles();
            console.log('Student Profiles Data:', profilesData);
            setStudentProfiles(profilesData);
          } else {
            navigate('/teacher/become');
          }
        }
      } catch (error) {
        console.error('Error fetching student profiles:', error);
        navigate('/teacher/become');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [verifyTeacher, getStudentProfiles, navigate, isAuthenticated, isInitializing]);

  return (
    <NavPage isTeacher={true} isLoading={isInitializing} initialActiveNav="students">
      <StudentsContainer>
        <Section>
            <DateHeader>Student Profiles</DateHeader>
            <p>Manage your student profiles below.</p>
            
            {studentProfiles && (
            <TeacherStudentProfiles
                profiles={studentProfiles.profiles || []}
                onRemoveStudent={handleRemoveStudent}
            />
            )}
        </Section>
      </StudentsContainer>
    </NavPage>
  );
}

export default TeacherStudents;