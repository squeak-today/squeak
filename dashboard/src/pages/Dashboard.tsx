import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import NavPage from '../components/NavPage';

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
`;

const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  margin: 0 0 ${theme.spacing.md};
  color: ${theme.colors.text.primary};
`;

const Subtitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.md};
  margin-top: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
`;

// dummy components for testing
const HomeContent = () => (
  <ContentContainer>
    <Title>Home Dashboard</Title>
    <Subtitle>View general information about your classroom here.</Subtitle>
  </ContentContainer>
);

const StudentsContent = () => (
  <ContentContainer>
    <Title>Students Management</Title>
    <Subtitle>Manage your students and their progress</Subtitle>
  </ContentContainer>
);

function Dashboard() {
  const routes = [
    { id: 'home', label: 'Home' },
    { id: 'students', label: 'Students' }
  ];

  return (
    <NavPage 
      routes={routes}
      initialActiveRoute="home"
    >
      <HomeContent />
      <StudentsContent />
    </NavPage>
  );
}

export default Dashboard; 