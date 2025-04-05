// Home.jsx
import { useNavigate } from 'react-router-dom';
import landingDrawing from '../assets/mouse_pencil.png';
import clickVideo from '../assets/clickVideo.mp4';
import teacherAccept from '../assets/teacher_accept.png';
import { useEffect } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import Footer from '../components/Footer';
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
  FAQSection,
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
            Bring your classroom to life with content tailored to your students' interests and skill level.
          </SubHeading>
          <ButtonContainer>
            <HeroButton onClick={handleGetStarted}>
              Get Started
            </HeroButton>
            <AccountButton onClick={() => navigate('/auth/login')}>
              I have an account
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
          We deliver languages the right way - enjoyable, understandable, and challenging content.
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
              Teachers, we're here to help <strong>you</strong>. With <strong>Classrooms</strong>, approve and reject content, and track student progress.
            </SectionSubHeading>
            <ButtonContainer>
              <TeacherHeroButton onClick={() => navigate('/auth/signup')}>
                Get started as a Teacher
              </TeacherHeroButton>
            </ButtonContainer>
          </ContentContainer>
          <WizardHat src={teacherAccept} alt="Teacher accepting content" />
        </SectionContentWrapper>
      </Section>

      <FAQSection>
        <SectionHeading>
          FAQs
        </SectionHeading>
        <FAQ />
      </FAQSection>

      <Footer />
    </BasicPage>
  );
}

export default Home;
