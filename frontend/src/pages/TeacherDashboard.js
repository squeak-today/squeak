import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../services/hooks/useTeacher'
import supabase from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';
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
  const [showClassroomInfo, setShowClassroomInfo] = useState(true);

  const [isInitializing, setIsInitializing] = useState(true);

  const {
    classroomInfo,
    verifyTeacher,
    fetchClassroomInfo,
  } = useTeacher();

  useEffect(() => {
    const init = async () => {
      try {
        if (verifyTeacher()) { fetchClassroomInfo(); }
      } catch (error) {
        console.error('Error fetching classroom info:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [verifyTeacher, fetchClassroomInfo, navigate]);

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
