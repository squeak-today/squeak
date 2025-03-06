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
  ButtonContainer,
  SubHeading,
  MainHeading,
  SectionHeading,
  SmallText,
  LandingImage,
  Highlight,
  Section,
  HeroButton,
  TeacherHeroButton,
  WizardHat,
  SectionContentWrapper,
  DemoVideo,
} from '../styles/pages/LandingPageStyles';

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

  return (
    <BasicPage showGetStarted>
      <HomeContainer>
        <ContentContainer>
          <MainHeading>Learn Languages Reading What You Love</MainHeading>
          <SubHeading>
            Engaging news and stories at your level, making language learning
            fun, stress-free, and truly rewarding.
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
        </ContentContainer>
        <div></div>
        <LandingImage
          src={landingDrawing}
          alt="Squeak Mouse Drawing"
        />
      </HomeContainer>

      <Section>
        <SectionContentWrapper>
          <ContentContainer>
            <SectionHeading>
              Squeak for <Highlight>Teachers</Highlight>
            </SectionHeading>
            <SubHeading>
              Teachers, we're here to help. Squeak offers content your students will enjoy with practice for vocabulary, grammar, speaking, and more. With <strong>Classrooms</strong>, students only see what you approve.
            </SubHeading>
            <ButtonContainer>
              <TeacherHeroButton onClick={() => navigate('/auth/login')}>
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
            <SubHeading>
              No need to pull out the dictionary to learn a new word! Just click, translate, and read on.
            </SubHeading>
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
