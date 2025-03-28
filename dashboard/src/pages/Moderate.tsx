import styled from 'styled-components';
import { theme } from '../styles/theme';
import NavPage from '../components/NavPage';
import TeacherStoryBrowser from '../components/TeacherStoryBrowser';

// TEMPORARY TEST DASHBAORD HOME PAGE
// YOU ACTUALLY NEED TO SEPARATE STYLES BUT IM TOO LAZY

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

function Moderate() {
  return (
    <NavPage>
      <ContentContainer>
        <Title>Moderate Content</Title>
        <TeacherStoryBrowser defaultLanguage="any" />
      </ContentContainer>
    </NavPage>
  );
}

export default Moderate; 