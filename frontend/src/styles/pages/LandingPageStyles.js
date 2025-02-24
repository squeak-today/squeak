import styled from 'styled-components';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import { theme } from '../theme';

export const HomeContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 75%;
  height: 82vh;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 90%;
    height: auto;
    padding: 20px;
  }
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  max-width: 50%;

  @media (max-width: 768px) {
    max-width: 95%;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    align-items: center;
    justify-content: center;
    width: 100%;
  }
`;

export const MainHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.xxl};
`;

export const SectionHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.xl};
`;

export const SubHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin: 1vh 0;
`;

export const SmallText = styled.p`
  font-family: 'Lora', serif;
  font-weight: 400;
  font-size: 1.1em;
  color: #575757;
  text-decoration: underline;
  cursor: pointer;
`;

export const LandingImage = styled.img`
  height: auto;
  max-height: 25em;
  aspect-ratio: 1 / 1;

  @media (max-width: 768px) {
    order: -1;
    width: 80%;
    margin: 0 auto;
  }
`;

export const Highlight = styled.span`
  background: linear-gradient(120deg, rgba(250, 212, 143, 0.5) 0%, rgba(250, 212, 143, 0.5) 100%);
  background-repeat: no-repeat;
  background-size: 100% 40%;
  background-position: 0 60%;
  display: inline;
  padding: 0.1em 0.3em;
  box-decoration-break: clone;
`;

export const TeacherSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60vh;
  padding: 3rem 0;
`;

export const TeacherContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 75%;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: 2rem;
  }
`;

export const TeacherTextContent = styled(TextContent)``;

export const WizardHat = styled.img`
  width: 250px;
  max-width: 100%;
  height: auto;
`;

export const TranslateFeatureSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60vh;
  padding: 3rem 0;
`;

export const TranslateContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 75%;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
`;

export const HeroButton = styled(Button)`
  width: 8em;
  aspect-ratio: 7 / 1.5;
  font-size: 1.5em;

  @media (max-width: 768px) {
    font-size: 1.5em;
    aspect-ratio: 7 / 1.5;
    max-width: 40vw;
  }

  @media (max-width: 480px) {
    width: 100%;
    font-size: 1.5em;
    aspect-ratio: 7 / 1.5;
    max-height: 2.5em;
    max-width: 192px;
  }
`;

export const TeacherHeroButton = styled(Button)`
  width: 12.5em;
  height: 2em;
  font-size: 1.5em;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: auto;
    padding: 0 2em;
    font-size: 1.2em;
    max-width: 80vw;
  }

  @media (max-width: 480px) {
    padding: 0 1.5em;
    font-size: 1.1em;
    max-width: 90vw;
  }
`;