// Home.jsx

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import landingDrawing from '../assets/mouse_reading.png';
import { MiscButton } from '../components/StyledComponents';
import { useEffect } from 'react';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';

const HomeContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 40px;
  max-width: 60%;
  height: 75vh;
  margin: 0 auto;
  

  /* On smaller screens, stack content vertically and reduce padding */
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 90%;
    height: auto;
    padding: 20px;
    gap: 20px;
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  max-width: 50%;
  text-align: center;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  /* Optionally make buttons full-width on mobile, 
     but the existing MiscButton styling might already handle this. */
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MainHeading = styled.h1`
  font-family: 'Noto Serif', serif;
  font-size: 2rem;
  color: #000000;
  margin: 0;
  line-height: 1.3;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const LandingImage = styled.img`
  width: 40%;
  height: auto;

  @media (max-width: 768px) {
    width: 80%;
    margin-bottom: 1rem; /* Add spacing when stacked above text */
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
    <BasicPage>
      <HomeContent>
        <LandingImage src={landingDrawing} alt="Squeak Mouse Drawing" />
        <TextContent>
          <MainHeading>
            Learn Languages Through Stories You Love
          </MainHeading>
          <ButtonContainer>
            <MiscButton 
              onClick={handleGetStarted}
              style={{ fontSize: '1.1rem', padding: '0.8em 3.5em' }}
            >
              Get Started
            </MiscButton>
            <MiscButton 
              onClick={() => navigate('/auth/login')}
              style={{ fontSize: '1.1rem', padding: '0.8em 3.5em' }}
            >
              I'm Back To Learn!
            </MiscButton>
          </ButtonContainer>
        </TextContent>
      </HomeContent>
    </BasicPage>
  );
}

export default Home;
