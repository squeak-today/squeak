// Home.jsx

import { useNavigate } from 'react-router-dom';
import landingDrawing from '../assets/mouse_pencil.png';
import wizardHat from '../assets/WizardHat.png';
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
  SmallText,
  LandingImage,
  Highlight,
  TeacherSection,
  TeacherContent,
  TeacherTextContent,
  WizardHat,
  TranslateFeatureSection,
  TranslateContent,
  TranslationCard,
  TranslationCardHeading,
  Arrow,
  TranslationDetails,
  HeroButton,
  TeacherHeroButton,
  TeacherHeading,
  TranslateHeading
} from '../styles/LandingPageStyles';

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
            <TeacherHeading>
              Squeak for <Highlight>Teachers</Highlight>
            </TeacherHeading>
            <SubHeading>
              Teachers, we're here to help. Squeak offers content your students will enjoy with practice for vocabulary, grammar, speaking, and more.
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
            <TranslateHeading>
              Translate with just a <Highlight>click</Highlight>
            </TranslateHeading>
            <SubHeading>
              No need to pull out the dictionary to learn a new word! Just click, translate, and read on.
            </SubHeading>
          </TextContent>
          <TranslationCard>
            <TranslationCardHeading>
              Bienvenue <Arrow>→</Arrow> Welcome
            </TranslationCardHeading>
            <TranslationDetails>
              <p><strong>Original:</strong> Bienvenue sur Squeak!</p>
              <p><strong>Translated:</strong> Welcome to Squeak!</p>
            </TranslationDetails>
          </TranslationCard>
        </TranslateContent>
      </TranslateFeatureSection>
    </BasicPage>
  );
}

export default Home;
