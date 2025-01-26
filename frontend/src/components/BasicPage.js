import { TransitionWrapper } from './PageTransition';
import { ArrowRight } from 'react-icons/fi';

import {
  NavHeader,
  HeaderLogo,
  FooterContainer,
  FooterLogo,
  FooterText,
  MiscButton,
  ButtonContainer,
  PageContainer,
  LogoText,
} from './StyledComponents'; // Updated import
import logo from '../assets/drawing_400.png';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi'; 

function BasicPage({ children, showLogout, onLogout }) {
  const navigate = useNavigate();

  return (
    <TransitionWrapper>
      <PageContainer>
        <NavHeader>
          <HeaderLogo
            src={logo}
            alt="Squeak Logo"
            onClick={() => navigate('/')}
          />
          <LogoText onClick={() => navigate('/')}>Squeak</LogoText>
          <ButtonContainer>
            <MiscButton
              as="a"
              href="/contact-support.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
              <FiArrowRight size={24} />
            </MiscButton>
          </ButtonContainer>
        </NavHeader>

        {/* Main Content */}
        {children}

        <FooterContainer>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FooterLogo src={logo} alt="Squeak Footer Logo" />
            <LogoText onClick={() => navigate('/')}>Squeak</LogoText>
          </div>
          <FooterText>© 2025 Squeak. All rights reserved.</FooterText>
        </FooterContainer>
      </PageContainer>
    </TransitionWrapper>
  );
}

export default BasicPage;


