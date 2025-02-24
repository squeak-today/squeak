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
  HomeContent,
  TextContent,
  ButtonContainer,
  SubHeading,
  MainHeading,
  SectionHeading,
  SmallText,
  LandingImage,
  Highlight,
  TeacherSection,
  TeacherContent,
  TeacherTextContent,
  WizardHat,
  TranslateFeatureSection,
  TranslateContent,
  HeroButton,
  TeacherHeroButton,
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
      <HomeContent>
        <TextContent>
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
        </TextContent>
        <div></div>
        <LandingImage
          src={landingDrawing}
          alt="Squeak Mouse Drawing"
        />
      </HomeContent>

      <TeacherSection>
        <TeacherContent>
          <TeacherTextContent>
            <SectionHeading>
              Squeak for <Highlight>Teachers</Highlight>
            </SectionHeading>
            <SubHeading>
              Teachers, we're here to help. Squeak offers content your students will enjoy with practice for vocabulary, grammar, speaking, and more. With <strong>Classrooms</strong>, students only see what you approve.
            </SubHeading>
            <ButtonContainer>
              <TeacherHeroButton onClick={() => navigate('/teacher/dashboard')}>
                Get started as a Teacher
                <FiArrowRight size={24} />
              </TeacherHeroButton>
            </ButtonContainer>
          </TeacherTextContent>
          <WizardHat src={wizardHat} alt="Wizard Hat" />
        </TeacherContent>
      </TeacherSection>

      <TranslateFeatureSection>
        <TranslateContent>
          <TextContent>
            <SectionHeading>
              Translate with just a <Highlight>click</Highlight>
            </SectionHeading>
            <SubHeading>
              No need to pull out the dictionary to learn a new word! Just click, translate, and read on.
            </SubHeading>
          </TextContent>
          <video autoPlay loop muted playsInline
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <source src={clickVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </TranslateContent>
      </TranslateFeatureSection>
    </BasicPage>
  );
}

export default Home;
