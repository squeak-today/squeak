import {NavHeader,
    HeaderLogo,
    Footer,
    MiscButton,
    PictureLogo} from '../components/StyledComponents';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/logo.png';
import landingDrawing from '../assets/mouse_reading.png';
import headerLogo from '../assets/drawing_400.png';
import { TransitionWrapper } from '../components/PageTransition';
import { useState, useEffect } from 'react';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

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
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // check for existing session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/learn');
            }
        });
    }, [navigate]);

    const handleGetStarted = () => {
        setIsLeaving(true);
        setTimeout(() => {
            navigate('/auth/signup');
        }, 300); // Match animation duration
    };

    return (
        <TransitionWrapper $isLeaving={isLeaving}>
            <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
                <NavHeader>
                    <HeaderLogo 
                        src={logo} 
                        alt="Squeak" 
                        onClick={() => navigate('/')} 
                    />
                    <PictureLogo src={headerLogo} alt="Squeak Mouse" />
                    <MiscButton 
                        href="https://forms.gle/LumHWSYaqLKV4KMa8"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Tell Us Anything! ❤️
                    </MiscButton>
                </NavHeader>

                <HomeContent>
                    <LandingImage src={landingDrawing} alt="Squeak Mouse Drawing" />
                    <TextContent>
                        <MainHeading>
                            Learn Languages Through Stories You Love
                        </MainHeading>
                        <ButtonContainer>
                            <MiscButton 
                                as="button"
                                onClick={handleGetStarted}
                                style={{ fontSize: '1.1rem', padding: '0.8em 3.5em' }}
                            >
                                Get Started
                            </MiscButton>
                            <MiscButton 
                                as="button"
                                onClick={() => navigate('/auth/login')}
                                style={{ fontSize: '1.1rem', padding: '0.8em 3.5em' }}
                            >
                                I'm Back To Learn!
                            </MiscButton>
                        </ButtonContainer>
                    </TextContent>
                </HomeContent>

                <Footer>
                    © 2024 Squeak. All rights reserved.
                </Footer>
            </div>
        </TransitionWrapper>
    );
}

export default Home;