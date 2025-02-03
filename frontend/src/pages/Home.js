// Home.jsx

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import landingDrawing from '../assets/mouse_pencil.png';
import { HeroButton } from '../components/StyledComponents';
import { useEffect } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import { FiArrowRight } from 'react-icons/fi'; 


const HomeContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 75%;
  height: 82vh;
  margin: 0 auto;

  /* On smaller screens, stack content vertically */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 90%;
    height: auto;
    padding: 20px;
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  max-width: 50%;

  @media (max-width: 768px) {
    max-width: 95%;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  /* Optionally make buttons full-width on mobile, 
     but the existing MiscButton styling might already handle this. */
  @media (max-width: 768px) {
    align-items: center; /* Center buttons horizontally */
    justify-content: center; /* Center buttons vertically */
    width: 100%;
  }
`;

const SubHeading = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  color: #333333; /* Slightly lighter color */
  text-align: left; /* Left-aligned like the main heading */
  margin-top: 1vh;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 36ch;
    text-align: center;
    margin-left: auto; /* Center horizontally */
    margin-right: auto; /* Center horizontally */
    width: 100%;
  }
  }
`;


const MainHeading = styled.h1`
  font-family: 'Lora', serif;
  font-weight: 400; /* Regular weight */
  font-size: 3.5em; /* Font size */
  color: #000000;
  line-height: 1.15;
  max-width: 14ch;
  text-align: left; /* Left aligned */
  white-space: normal; /* Allow text to wrap normally */
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5em; /* Adjust font size for smaller screens */
    max-width: 20ch; /* Slightly wider for smaller screens */
    text-align: center; /* center aligned */
  }

  @media (max-width: 480px) {
    font-size: 2.2em; /* Further adjustment for very small screens */
    max-width: 24ch; /* Wider for very small screens */
    text-align: center; /* center aligned */

  }
`;

const SmallText = styled.p`
  font-family: 'Lora', serif;
  font-weight: 400; /* Regular weight */
  font-size: 1.1em; /* Font size */
  color: #575757;
  text-decoration: underline;
  cursor: pointer; /* should fix Ibeam ossue*/


`;

const LandingImage = styled.img`
  height: auto;
  max-height: 25em;
  aspect-ratio: 1 / 1;

  /* Change order on mobile */
  @media (max-width: 768px) {
    order: -1; /* Move image to appear first */
    width: 80%;
    margin: 0 auto; /* Center on mobile */
  }
`;


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
          <MainHeading>Learn Languages Through Stories</MainHeading>
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
    </BasicPage>
  );
}

export default Home;
