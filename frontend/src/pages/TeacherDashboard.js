import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import supabase from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';
import TeacherStoryBrowser from '../components/TeacherStoryBrowser';
import TeacherStudentProfiles from 'components/TeacherStudentProfile';
import {
  Section,
  ToggleButton,
  ButtonContainer,
  DateHeader,
  ClassroomInfoContainer,
  ClassroomInfoText
} from '../styles/TeacherDashboardPageStyles';

function TeacherDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [classroomInfo, setClassroomInfo] = useState(null);
  const [studentProfiles, setStudentProfiles] = useState(null); // New state for profiles
  const [showClassroomInfo, setShowClassroomInfo] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const {
    isAuthenticated,
    verifyTeacher,
    getClassroomInfo,
    getStudentProfiles,
    removeStudent
  } = useTeacherAPI();

  const handleRemoveStudent = async (userId) => {
    try {
      await removeStudent(userId);
      // Refresh profiles after removal
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
          let data = await verifyTeacher();
          if (data.exists) {
            data = await getClassroomInfo();
            setClassroomInfo(data);
            // Fetch student profiles on initialization
            const profilesData = await getStudentProfiles();
            console.log('Student Profiles Data:', profilesData);
            setStudentProfiles(profilesData);
          } else { 
            navigate('/teacher/become'); 
          }
        }
      } catch (error) {
        console.error('Error fetching classroom info:', error);
        navigate('/teacher/become');
      } finally {
        setIsInitializing(false);
      }
    };
  
    init();
  }, [verifyTeacher, getClassroomInfo, getStudentProfiles, navigate, showNotification, isAuthenticated, isInitializing]);

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      showNotification('Error signing out. Please try again.');
    }
  };

  return (
    <BasicPage showLogout onLogout={handleLogout} isLoading={isInitializing}>
      <Section>
        <Section>
          <ButtonContainer>
            <ToggleButton onClick={() => setShowClassroomInfo(prev => !prev)}>
              {showClassroomInfo ? 'Hide Classroom Info' : 'Show Classroom Info'}
            </ToggleButton>
          </ButtonContainer>
          {showClassroomInfo && classroomInfo && (
            <ClassroomInfoContainer>
              <ClassroomInfoText>
                <strong>Classroom ID:</strong> {classroomInfo.classroom_id}
              </ClassroomInfoText>
              <ClassroomInfoText>
                <strong>Students Count:</strong> {classroomInfo.students_count}
              </ClassroomInfoText>
              {/* Add student profiles display */}
              {studentProfiles && (
              <>
                <DateHeader>Student Profiles</DateHeader>
                <TeacherStudentProfiles 
                  profiles={studentProfiles.profiles || []}
                  onRemoveStudent={handleRemoveStudent}  
                />
              </>
            )}
            </ClassroomInfoContainer>
          )}
        </Section>

        <DateHeader>Manage Classroom Content</DateHeader>
        <TeacherStoryBrowser 
          defaultLanguage="any"
        />
      </Section>
    </BasicPage>
  );
}

export default TeacherDashboard;