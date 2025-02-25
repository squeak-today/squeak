import styled, { keyframes } from 'styled-components';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import { theme } from '../theme';

export const HomeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
`;

export const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  height: 100%;
  max-height: 600px;
  object-fit: contain;
  mask-image: linear-gradient(to bottom, 
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 20%,
    rgba(0, 0, 0, 0.1) 60%,
    rgba(0, 0, 0, 0) 80%
  );
  z-index: 1;
`;

export const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 90vw;
  margin: 0 auto;
  margin-top: 30vh;

  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-top: 40vh;
    max-width: 90vw;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

export const Section = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60vh;
`;

export const SmallSection = styled(Section)`
  min-height: 5vh;
  flex-direction: column;
  align-items: center;
`;

export const SectionContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 75%;
  width: 100%;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
`;

const fadeInFromTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const AnimatedWord = styled.span`
  display: inline-block;
  opacity: 0;
  animation: ${fadeInFromTop} 0.5s ease forwards;
  animation-delay: ${props => props.$delay}s;
`;

export const MainHeading = styled(Heading)`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: ${theme.typography.fontSize.xxl};
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3em;
`;

export const SectionHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.xl};
`;

export const SubHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin: 1vh 0;
  max-width: 40vw;

  @media (max-width: ${theme.breakpoints.tablet}) {
    max-width: 80vw;
  }
`;

export const SmallText = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: 400;
  font-size: 1.1em;
  color: ${theme.colors.text.secondary};
  text-decoration: underline;
  cursor: pointer;
`;

export const HeroButton = styled(Button)`
  width: 8em;
  aspect-ratio: 7 / 1.5;
  font-size: 1.5em;

  @media (max-width: ${theme.breakpoints.tablet}) {
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

  @media (max-width: ${theme.breakpoints.tablet}) {
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

export const WizardHat = styled.img`
  width: 250px;
  max-width: 100%;
  height: auto;
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

export const DemoVideo = styled.video`
  width: 50vh;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const SchoolsText = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

export const LogoContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md} 0;
`;

export const SchoolLogo = styled.img`
  height: 3rem;
  width: auto;
  object-fit: contain;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  filter: grayscale(100%);

  &:hover {
    opacity: 1;
    filter: none;
  }
`;