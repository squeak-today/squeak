import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import NavPage from '../components/NavPage';
import styled from 'styled-components';
import {
  Section,
  DateHeader,
  ClassroomInfoContainer,
  ClassroomInfoText,
} from '../styles/TeacherDashboardPageStyles';

// Add additional styling to ensure content doesn't overlap with sidebar
const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

function TeacherDashboard() {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const [classroomInfo, setClassroomInfo] = useState(null);
  const {
    isAuthenticated,
    verifyTeacher,
    getClassroomInfo,
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
  }, [verifyTeacher, getClassroomInfo, navigate, isAuthenticated, isInitializing]);

  return (
    <NavPage isTeacher={true} isLoading={isInitializing} initialActiveNav="dashboard">
      <DashboardContainer>
        <Section>
          <DateHeader>Welcome to Teacher Dashboard</DateHeader>
          {classroomInfo && (
            <ClassroomInfoContainer>
              <ClassroomInfoText>
                <strong>Classroom ID:</strong> {classroomInfo.classroom_id}
              </ClassroomInfoText>
              <ClassroomInfoText>
                <strong>Students Count:</strong> {classroomInfo.students_count}
              </ClassroomInfoText>
            </ClassroomInfoContainer>
          )}
          <p>
            Use the navigation on the left to access Analytics, Moderate Stories, or manage Student Profiles.
          </p>
        </Section>
      </DashboardContainer>
    </NavPage>
  );
}

export default TeacherDashboard;