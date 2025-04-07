// Home.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import landingDrawing from '../assets/mouse_pencil.png';
import teacherAccept from '../assets/teacher_accept.png';
import { useEffect, useRef, useState } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import Footer from '../components/Footer';
import SectionNav from '../components/SectionNav';
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
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const featuresRef = useRef(null);
  const faqRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/learn');
      }
    });
  }, [navigate]);

  useEffect(() => {
    const scrollToSection = () => {
      const params = new URLSearchParams(location.search);
      const section = params.get('section');
      
      if (section) {
        switch(section) {
          case 'features':
            featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
            break;
          case 'faq':
            faqRef.current?.scrollIntoView({ behavior: 'smooth' });
            break;
        }
      }
    };

    if (!initialLoadComplete) {
      const timer = setTimeout(() => {
        scrollToSection();
        setInitialLoadComplete(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      scrollToSection();
    }
  }, [location.search, initialLoadComplete]);

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
    <BasicPage showGetStarted showSectionNav sections={[
      { label: "Features", href: "features" },
      { label: "FAQs", href: "faq" },
    ]}>
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

      <TitledSection ref={featuresRef} id="features">
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

      <FAQSection ref={faqRef} id="faq">
        <SectionHeading>
          FAQs
        </SectionHeading>
        <FAQ faqs={[
          {
            question: "Is Squeak available for multiple languages?",
            answer: "Currently, Squeak supports French and Spanish. We're working hard to add more languages soon!"
          },
          {
            question: "Is Squeak free?",
            answer: "Yes! Squeak is 100% free for teachers and students."
          },
          {
            question: "How do you source your news articles?",
            answer: "We combine hundreds of different news sources and create articles based on the info. Squeak will NEVER write any information that is not from an online, trusted source."
          }
        ]}/>
      </FAQSection>

      <Footer />
    </BasicPage>
  );
}

export default Home;
