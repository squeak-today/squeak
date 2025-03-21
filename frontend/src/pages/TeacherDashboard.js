import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import supabase from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';
import NavPage from '../components/NavPage';
import TeacherStoryBrowser from '../components/TeacherStoryBrowser';
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
  const [showClassroomInfo, setShowClassroomInfo] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const {
    isAuthenticated,
    verifyTeacher,
    getClassroomInfo
  } = useTeacherAPI();

  useEffect(() => {
    if (!isInitializing) return;
    const init = async () => {
      try {
        if (isAuthenticated) {
          let data = await verifyTeacher();
          if (data.exists) {
            data = await getClassroomInfo();
            setClassroomInfo(data);
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
  }, [verifyTeacher, getClassroomInfo, navigate, showNotification, isAuthenticated, isInitializing]);

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
    <NavPage showTeach={true} isLoading={isInitializing} initialActiveNav="teach">
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
            </ClassroomInfoContainer>
          )}
        </Section>

        <DateHeader>Manage Classroom Content</DateHeader>
        <TeacherStoryBrowser 
          defaultLanguage="any"
        />
      </Section>
    </NavPage>
  );
}

export default TeacherDashboard;
