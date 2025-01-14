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

    return (
        <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
            <NavHeader>
                <HeaderLogo src={logo} alt="Squeak" />
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
					<MiscButton 
						as="button"
						onClick={() => navigate('/learn')}
						style={{ fontSize: '1.1rem', padding: '0.8em 3.5em' }}
					>
						Get Started
					</MiscButton>
				</TextContent>
			</HomeContent>

            <Footer>
                © 2024 Squeak. All rights reserved.
            </Footer>
        </div>
    );
}

export default Home;