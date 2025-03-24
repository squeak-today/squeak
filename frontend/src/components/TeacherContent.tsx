import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useNotification } from '../context/NotificationContext';
import NavPage from '../components/NavPage';
import TeacherStoryBrowser from '../components/TeacherStoryBrowser';
import styled from 'styled-components';
import {
  Section,
  DateHeader,
} from '../styles/TeacherDashboardPageStyles';

// Add additional styling to ensure content doesn't overlap with sidebar
const ContentContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

function TeacherContent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isInitializing, setIsInitializing] = useState(true);
  const {
    isAuthenticated,
    verifyTeacher,
  } = useTeacherAPI();

  useEffect(() => {
    if (!isInitializing) return;
    const init = async () => {
      try {
        if (isAuthenticated) {
          const data = await verifyTeacher();
          if (!data.exists) {
            navigate('/teacher/become');
          }
        }
      } catch (error) {
        console.error('Error verifying teacher:', error);
        navigate('/teacher/become');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [verifyTeacher, navigate, isAuthenticated, isInitializing]);

  return (
    <NavPage isTeacher={true} isLoading={isInitializing} initialActiveNav="content">
      <ContentContainer>
        <Section>
          <DateHeader>Manage Classroom Content</DateHeader>
          <p>Use the tools below to browse and moderate stories for your classroom.</p>
          <TeacherStoryBrowser defaultLanguage="any" />
        </Section>
      </ContentContainer>
    </NavPage>
  );
}

export default TeacherContent;