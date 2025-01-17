import { TransitionWrapper } from './PageTransition';
import { NavHeader, HeaderLogo, PictureLogo, Footer, MiscButton } from './StyledComponents';
import logo from '../assets/logo.png';
import headerLogo from '../assets/drawing_400.png';
import { useNavigate } from 'react-router-dom';

function BasicPage({ children, showLogout, onLogout }) {
    const navigate = useNavigate();

    return (
        <TransitionWrapper>
            <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
                <NavHeader>
                    <HeaderLogo 
                        src={logo} 
                        alt="Squeak" 
                        onClick={() => navigate('/')} 
                    />
                    <PictureLogo src={headerLogo} alt="Squeak Mouse" />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <MiscButton 
                            as="a"
                            href="https://forms.gle/LumHWSYaqLKV4KMa8"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Tell Us Anything! ❤️
                        </MiscButton>
                        {showLogout && (
                            <MiscButton onClick={onLogout}>
                                Logout
                            </MiscButton>
                        )}
                    </div>
                </NavHeader>

                {children}

                <Footer>
                    © 2024 Squeak. All rights reserved.
                </Footer>
            </div>
        </TransitionWrapper>
    );
}

export default BasicPage; 