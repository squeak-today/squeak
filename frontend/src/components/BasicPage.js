import { TransitionWrapper } from './PageTransition';
import {
  NavHeader,
  HeaderLogo,
  FooterContainer,
  HeaderText,
  FooterLogo,
  FooterText,
  HeaderButton,
  ButtonContainer,
  PageContainer,
  LogoText,
} from './StyledComponents'; // Updated import
import logo from '../assets/drawing_400.png';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi'; 

function BasicPage({ children, showLogout, onLogout, showGetStarted }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };


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
            <HeaderText onClick={() => navigate('/contact-support.html')}>Contact Us</HeaderText>
            <div></div>
            {showLogout && (
              <HeaderButton onClick={onLogout}>
                Logout
                <FiArrowRight size={24} />
              </HeaderButton>
            )}
            {showGetStarted && (
              <HeaderButton
                onClick={handleGetStarted}
              >
                Get Started
                <FiArrowRight size={24} />
              </HeaderButton>
            )}
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


