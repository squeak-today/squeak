// Home.jsx
import { useNavigate } from 'react-router-dom';
import landingDrawing from '../assets/mouse_pencil.png';
import wizardHat from '../assets/WizardHat.png';
import clickVideo from '../assets/clickVideo.mp4';
import { useEffect } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import {
  HomeContainer,
  ContentContainer,
  CenteredContentContainer,
  ButtonContainer,
  SubHeading,
  MainHeading,
  SectionHeading,
  SectionSubHeading,
  AccountButton,
  Highlight,
  Section,
  TitledSection,
  HeroButton,
  TeacherHeroButton,
  WizardHat,
  SectionContentWrapper,
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
import mac from '../assets/schools/mac.png';
import ddsb from '../assets/schools/ddsb.png';
import uwo from '../assets/schools/uwo.png';
import FeatureSlideshow from '../components/FeatureSlideshow';
import FAQ from '../components/FAQ';
import DemoVideo from '../components/DemoVideo';

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
    { id: 4, src: mac, alt: "Mcmaster University" },
    { id: 5, src: ddsb, alt: "Durham District School Board" },
    { id: 6, src: uwo, alt: "Western University" },
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
            We’ve learned everything through stories, why try to learn a language in any other way?
          </SubHeading>
          <ButtonContainer>
            <HeroButton onClick={handleGetStarted}>
              Get Started
            </HeroButton>
            <AccountButton onClick={() => navigate('/auth/login')}>
              I already have an account
            </AccountButton>
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
          Built for the <Highlight>Classroom</Highlight>
        </SectionHeading>
        <SubHeading>
          We designed Squeak to teach languages the right way - through enjoyable and understandable content.
        </SubHeading>
        <FeatureSlideshow />
      </TitledSection>

      

      <Section>
        <SectionContentWrapper>
          <ContentContainer style={{marginTop: "0vh"}}>
            <SectionHeading>
              Squeak for <Highlight>Teachers</Highlight>
            </SectionHeading>
            <SectionSubHeading>
              Teachers, we're here to help. Squeak offers content your students will enjoy with practice for vocabulary, grammar, speaking, and more. With <strong>Classrooms</strong>, students only see what you approve.
            </SectionSubHeading>
            <ButtonContainer>
              <TeacherHeroButton onClick={() => navigate('/auth/login')}>
                Get started as a Teacher
              </TeacherHeroButton>
            </ButtonContainer>
          </ContentContainer>
          <WizardHat src={wizardHat} alt="Wizard Hat" />
        </SectionContentWrapper>
      </Section>

      <Section>
        <SectionContentWrapper>
          <ContentContainer  style={{marginTop: "0vh"}}>
            <SectionHeading>
              Translate with just a <Highlight>click</Highlight>
            </SectionHeading>
            <SectionSubHeading>
              No need to pull out the dictionary to learn a new word! Just click, translate, and read on.
            </SectionSubHeading>
          </ContentContainer>
          <DemoVideo src={clickVideo} width="50%" />
        </SectionContentWrapper>
      </Section>

      <TitledSection>
        <SectionHeading>
          FAQs
        </SectionHeading>
        <FAQ />
      </TitledSection>

      
    </BasicPage>
  );
}

export default Home;
