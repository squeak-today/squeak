import { useNavigate, useLocation } from 'react-router-dom';
import landingDrawing from '../assets/mouse_pencil.png';
import { useEffect, useRef, useState } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import Footer from '../components/Footer';
import SubscriptionDetails from '../components/SubscriptionDetails';
import {
  HomeContainer,
  CenteredContentContainer,
  ButtonContainer,
  SubHeading,
  MainHeading,
  SectionHeading,
  AccountButton,
  Highlight,
  TitledSection,
  FAQSection,
  HeroButton,
  BackgroundImage,
  AnimatedWord,
  SmallSection,
} from '../styles/pages/LandingPageStyles';
import french from '../assets/flags/french.png';
import spanish from '../assets/flags/spanish.png';
import FeatureSlideshow from '../components/FeatureSlideshow';
import FAQ from '../components/FAQ';

interface LanguageFlag {
  id: number;
  src: string;
  alt: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(true);
  
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

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
          case 'pricing':
            pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleGetStarted = (): void => {
    navigate('/auth/signup');
  };

  const handleRoleSelection = (role: 'individual' | 'teacher'): void => {
    if (role === 'teacher') {
      navigate('/educators');
    } else {
      setShowRoleModal(false);
    }
  };

  const headingWords = "Learn Languages Reading What You Love.".split(" ");

  const languageFlags: LanguageFlag[] = [
    { id: 1, src: french, alt: "French" },
    { id: 2, src: spanish, alt: "Spanish" },
  ];

  return (
    <BasicPage showGetStarted showSectionNav sections={[
      { label: "Features", href: "features" },
      { label: "Pricing", href: "pricing" },
      { label: "FAQs", href: "faq" },
    ]}>
      {showRoleModal && (
        <div className="z-1000 bg-black/50 flex fixed inset-0 justify-center items-center">
          <div className="rounded-[16px] bg-white py-2 px-8 w-auto">
            <h1 className="mt-4 text-center text-lg font-primary mb-4">I am a...</h1>
            <div className="mb-4 items-center justify-center flex flex-row gap-4">
              <button onClick={() => handleRoleSelection('individual')}
                className="cursor-pointer border-none font-secondary hover:bg-selected bg-item-background bg-gray-200 text-black py-3 px-12 rounded-[16px] text-base transition-colors duration-200 ease-in-out"
              >
                Individual
              </button>
              <button onClick={() => handleRoleSelection('teacher')}
                className="cursor-pointer border-none font-secondary hover:bg-selected bg-item-background bg-gray-200 text-black py-3 px-12 rounded-[16px] text-base transition-colors duration-200 ease-in-out"
              >
                Teacher
              </button>
            </div>
          </div>
        </div>
      )}
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
            Fluency with an effective, all-around platform using content tailored to your interests and skill level.
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
        <p className="text-md text-gray-600 mb-0 text-center font-secondary">
          Our supported languages (with more coming soon!)
        </p>
        <div className="flex flex-wrap gap-8 items-center justify-center py-4 w-[80vw] max-w-[1200px]">
          {languageFlags.map(flag => (
            <img
              key={flag.id}
              src={flag.src}
              alt={flag.alt}
              className="md:grayscale-50 rounded-[8px] h-12 w-auto object-contain md:opacity-60 opacity-100 grayscale-0 transition-opacity duration-300 ease-in-out hover:opacity-100 hover:grayscale-0 my-2"
            />
          ))}
        </div>
      </SmallSection>

      <TitledSection ref={featuresRef} id="features">
        <SectionHeading>
          Built for <Highlight>Everyone</Highlight>
        </SectionHeading>
        <SubHeading>
          We deliver languages the right way - enjoyable, understandable, and challenging content.
        </SubHeading>
        <FeatureSlideshow />
      </TitledSection>
      
      <TitledSection ref={pricingRef} id="pricing">
        <SectionHeading>
          Simple <Highlight>Pricing</Highlight>
        </SectionHeading>
        <SubHeading>
          <i>Quality learning for every student.</i>
        </SubHeading>
        <div className="flex justify-center gap-8 flex-wrap mt-8">
          <SubscriptionDetails
            title="Free"
            price={0}
            priceUnit="/month"
            benefits={[
              "Unlimited stories",
              "Unlimited articles",
              "Unlimited exercises",
              "Basic translation features"
            ]}
            buttonText="Sign Up"
            onButtonClick={() => navigate('/auth/signup')}
          />
          <SubscriptionDetails
            title="Premium"
            price={0.99}
            priceUnit="/month"
            benefits={[
              "Everything in Free",
              "Natural Pronunciations",
              "Premium Speech-to-Text",
              "Audiobook Mode",
              "Tutor Mode"
            ]}
            buttonText="Go Premium"
            onButtonClick={() => navigate('/auth/signup')}
          />
        </div>
      </TitledSection>

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
            answer: "Yes! Squeak's full content library and basic exercises are 100% free."
          },
          {
            question: "How do you source your news articles?",
            answer: "We combine hundreds of different news sources and create articles based on the info, translated into target language and difficulty. Squeak will NEVER make up and write any information that is not from an external source."
          },
          {
            question: "What are the exercises in Squeak?",
            answer: "Squeak offers exercises across all skills: writing, reading, listening, and speaking. Each story and articles comes with questions to test understanding, forcing critical thinking and practice with forming thoughts (sometimes spoken/listened to!). We also offer Audiobook and Tutor Mode for conversational practice to Premium users."
          }
        ]}/>
      </FAQSection>

      <div className="w-full min-h-[10vh] flex flex-col items-center justify-center bg-white py-8">
        <h2 className="font-normal px-4 md:px-0 md:text-4xl text-lg mb-8 text-center font-primary">
          Learn the right way with <Highlight>Squeak!</Highlight>
        </h2>
        <button 
          onClick={handleGetStarted}
          className="cursor-pointer border-none font-secondary text-md bg-primary bg-selected text-black py-3 px-12 rounded-[16px] text-md transition-colors duration-200 ease-in-out"
        >
          Get Started
        </button>
      </div>

      <Footer />
    </BasicPage>
  );
};

export default Home;
