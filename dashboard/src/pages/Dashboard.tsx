import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { TransitionWrapper } from '../styles/PageTransition';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  text-align: center;
  margin: 0;
  color: ${theme.colors.text.primary};
`;

const Subtitle = styled.h2`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.md};
  text-align: center;
  margin-top: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
`;

function Dashboard() {
  return (
    <TransitionWrapper $isLeaving={false}>
      <DashboardContainer>
        <Title>Coming Soon!</Title>
        <Subtitle>Keep on teaching, a great dashboard is on its way :)</Subtitle>
      </DashboardContainer>
    </TransitionWrapper>
  );
}

export default Dashboard; 