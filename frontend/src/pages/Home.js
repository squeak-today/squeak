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
`;

const TextContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    max-width: 50%;
    text-align: center;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const MainHeading = styled.h1`
    font-family: 'Noto Serif', serif;
    font-size: 2rem;
    color: #000000;
    margin: 0;
    line-height: 1.3;
    text-align: center;
`;

const LandingImage = styled.img`
    width: 40%;
    height: auto;
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