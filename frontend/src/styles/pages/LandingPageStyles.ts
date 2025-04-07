import styled, { keyframes } from 'styled-components';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import { theme } from '../theme';

export const HomeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 75vh;
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
    rgba(0, 0, 0, 1.0) 0%,
    rgba(0, 0, 0, 1.0) 20%,
    rgba(0, 0, 0, 0.75) 40%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 1;
`;

export const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  margin: 0 auto;
  margin-top: 50vh;
  height: 100%;

  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-top: 40vh;
    max-width: 90vw;
  }
`;

export const CenteredContentContainer = styled(ContentContainer)`
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 1rem;
  gap: 2em;

`;

export const Section = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60vh;
  margin-bottom: ${theme.spacing.sm};
`;

export const TitledSection = styled(Section)`
  flex-direction: column;
  margin-top: 8rem;
  margin-bottom: 0rem;
`;

export const FAQSection = styled(TitledSection)`
  margin-top: 0rem;
  margin-bottom: 4rem;
`;

export const SmallSection = styled(Section)`
  min-height: 5vh;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
`;

export const SectionContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 75%;
  width: 100%;
  margin: 0 auto;
  min-height: 60vh;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    align-items: center;
    justify-content: center;
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

export const AnimatedWord = styled.span<{ $delay: number }>`
  display: inline-block;
  opacity: 0;
  animation: ${fadeInFromTop} 0.5s ease forwards;
  animation-delay: ${props => props.$delay}s;
`;

export const MainHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.xxl};
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3em;
`;

export const SubHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.lg};
  font-family: ${theme.typography.fontFamily.secondary};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin: 1vh 0;
  max-width: 60vw;

  @media (max-width: ${theme.breakpoints.tablet}) {
    max-width: 80vw;
  }
`;

export const SectionHeading = styled(Heading)`
  text-align: left;
  font-size: ${theme.typography.fontSize.xl};


  @media (max-width: ${theme.breakpoints.tablet}) {
    text-align: center;
  }
`;

export const SectionSubHeading = styled(Heading)`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  text-align: left;
  margin: 1vh 0;
  max-width: 40vw;

  @media (max-width: ${theme.breakpoints.tablet}) {
    max-width: 80vw;
    text-align: center;
    margin: 1vh auto;
  }
`;

export const AccountButton = styled(Button)`
  width: 15em;
  font-size: 1.25em;
  aspect-ratio: 7 / 1;
  background: #ECE9DF;


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

export const HeroButton = styled(Button)`
  width: 9em;
  font-size: 1.25em;
  aspect-ratio: 7 / 1;

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
  width: 14em;
  height: 2em;
  font-size: 1.25em;
  white-space: nowrap;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: auto;
    padding: 0 2em;
    font-size: 1.2em;
    max-width: 80vw;
    margin: 0 auto;
    display: block;
  }

  @media (max-width: 480px) {
    padding: 0 1.5em;
    font-size: 1.1em;
    max-width: 90vw;
  }
`;

export const WizardHat = styled.img`
  width: 40%;
  max-width: 100%;
  height: auto;
  border-radius: 20px;
  object-fit: cover;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 80%;
    margin: 0 auto;
    display: block;
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
  flex-wrap: wrap;
  gap: ${theme.spacing.xl};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md} 0;
  width: 80vw;
  max-width: 1200px;
`;

export const SchoolLogo = styled.img`
  height: 3rem;
  width: auto;
  object-fit: contain;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  filter: grayscale(100%);
  margin: ${theme.spacing.sm} 0;

  &:hover {
    opacity: 1;
    filter: none;
  }
`;