// Home.jsx

import { useNavigate } from 'react-router-dom';
import landingDrawing from '../assets/mouse_pencil.png';
import wizardHat from '../assets/WizardHat.png';
import clickVideo from '../assets/clickVideo.mp4';
import { useEffect } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import { FiArrowRight } from 'react-icons/fi';
import {
  HomeContainer,
  ContentContainer,
  CenteredContentContainer,
  ButtonContainer,
  SubHeading,
  MainHeading,
  SectionHeading,
  SectionSubHeading,
  SmallText,
  Highlight,
  Section,
  TitledSection,
  HeroButton,
  TeacherHeroButton,
  WizardHat,
  SectionContentWrapper,
  DemoVideo,
  BackgroundImage,
  AnimatedWord,
  SmallSection,
  SchoolsText,
  LogoContainer,
  SchoolLogo,
} from '../styles/pages/LandingPageStyles';
import tdsb from '../assets/schools/tdsb.png';
import uw from '../assets/schools/uw.png';
import wlu from '../assets/schools/wlu.png';
import FeatureSlideshow from '../components/FeatureSlideshow';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/learn');
      }
    });
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const headingWords = "Learn Languages Reading What You Love.".split(" ");

  const schoolLogos = [
    { id: 1, src: tdsb, alt: "Toronto District School Board" },
    { id: 2, src: uw, alt: "University of Waterloo" },
    { id: 3, src: wlu, alt: "Wilfrid Laurier University" },
  ];

  return (
    <BasicPage showGetStarted>
      <HomeContainer>
        <BackgroundImage
          src={landingDrawing}
          alt="Squeak Mouse Drawing"
        />
        <CenteredContentContainer>
          <MainHeading>
            {headingWords.map((word, index) => (
              <AnimatedWord key={index} $delay={0.5 + (index * 0.15)}>
                {word}
              </AnimatedWord>
            ))}
          </MainHeading>
          <SubHeading>
            Bring your classroom to life with content tailored to your students' interests and skill level.
          </SubHeading>
          <ButtonContainer>
            <HeroButton onClick={handleGetStarted}>
              Get Started
              <FiArrowRight size={24} />
            </HeroButton>
            <SmallText onClick={() => navigate('/auth/login')}>
              I already have an account
            </SmallText>
          </ButtonContainer>
        </CenteredContentContainer>
      </HomeContainer>

      <SmallSection>
        <SchoolsText>Used by students at...</SchoolsText>
        <LogoContainer>
          {schoolLogos.map(logo => (
            <SchoolLogo
              key={logo.id}
              src={logo.src}
              alt={logo.alt}
            />
          ))}
        </LogoContainer>
      </SmallSection>

      <TitledSection>
        <SectionHeading>
          Built for the Classroom
        </SectionHeading>
        <FeatureSlideshow />
      </TitledSection>

      <Section>
        <SectionContentWrapper>
          <ContentContainer>
            <SectionHeading>
              Squeak for <Highlight>Teachers</Highlight>
            </SectionHeading>
            <SectionSubHeading>
              Teachers, we're here to help. Squeak offers content your students will enjoy with practice for vocabulary, grammar, speaking, and more. With <strong>Classrooms</strong>, students only see what you approve.
            </SectionSubHeading>
            <ButtonContainer>
              <TeacherHeroButton onClick={() => navigate('/teacher/dashboard')}>
                Get started as a Teacher
                <FiArrowRight size={24} />
              </TeacherHeroButton>
            </ButtonContainer>
          </ContentContainer>
          <WizardHat src={wizardHat} alt="Wizard Hat" />
        </SectionContentWrapper>
      </Section>

      <Section>
        <SectionContentWrapper>
          <ContentContainer>
            <SectionHeading>
              Translate with just a <Highlight>click</Highlight>
            </SectionHeading>
            <SectionSubHeading>
              No need to pull out the dictionary to learn a new word! Just click, translate, and read on.
            </SectionSubHeading>
          </ContentContainer>
          <DemoVideo autoPlay loop muted playsInline>
            <source src={clickVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </DemoVideo>
        </SectionContentWrapper>
      </Section>
    </BasicPage>
  );
}

export default Home;
