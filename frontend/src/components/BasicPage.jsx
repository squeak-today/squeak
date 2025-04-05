import { TransitionWrapper } from './PageTransition';
import { useState } from 'react';
import {
  NavHeader,
  HeaderLogo,
  FooterContainer,
  HeaderText,
  MobileMenuIcon,
  MobileMenu,
  FooterText,
  HeaderButton,
  ButtonContainer,
  PageContainer,
  LogoText,
  MenuText,
} from './StyledComponents';
import {
  LoadingOverlay,
  LoadingLogo,
  LoadingText,
  Spinner
} from '../styles/BasicPageStyles';
import logo from '../assets/drawing_400.png';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi'; 
import { AiOutlineMenu } from 'react-icons/ai';  // hamburger/waffle icon

function BasicPage({ 
  children, 
  showLogout, 
  onLogout, 
  showGetStarted, 
  showTeach = false,
  showJoinClassroom = false,
  isLoading = false
}) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
    <TransitionWrapper>
      {isLoading && (
        <LoadingOverlay>
          <LoadingLogo src={logo} alt="Squeak Logo" />
          <Spinner />
          <LoadingText>Loading...</LoadingText>
        </LoadingOverlay>
      )}
    </TransitionWrapper>
    {!isLoading && (<TransitionWrapper>
      <PageContainer>
        <NavHeader>
          <HeaderLogo
            src={logo}
            alt="Squeak Logo"
            onClick={() => navigate('/')}
          />
          <LogoText onClick={() => navigate('/')}>Squeak</LogoText>
          
          <ButtonContainer>
            {showLogout && (
              <>
                {showTeach && (
                  <HeaderText onClick={() => navigate('/teacher')}>
                    Teach
                  </HeaderText>
                )}
                {showJoinClassroom && (
                  <HeaderText onClick={() => navigate('/student/become')}>
                    Join Classroom
                  </HeaderText>
                )}
                <HeaderText onClick={() => window.open('/contact-support.html', '_blank')}>
                  Contact Us
                </HeaderText>
                <HeaderText onClick={onLogout}>
                  Logout
                </HeaderText>
              </>
            )}
            <div></div>
            {showLogout && (
              <MobileMenuIcon onClick={toggleMobileMenu}>
                <AiOutlineMenu size={24} />
              </MobileMenuIcon>
            )}

            <MobileMenu isOpen={isMobileMenuOpen}>
              {showTeach && (
                <MenuText
                  onClick={() => {
                    navigate('/teacher');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Teach
                </MenuText>
              )}
              {showJoinClassroom && (
                <MenuText
                  onClick={() => {
                    navigate('/student/become');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Join Classroom
                </MenuText>
              )}
              <MenuText
                onClick={() => {
                  window.open('/contact-support.html', '_blank');
                  setIsMobileMenuOpen(false);
                }}
              >
                Contact Us
              </MenuText>
              <MenuText
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </MenuText>
            </MobileMenu>
            
            {showGetStarted && (
              <>
                <HeaderText onClick={() => window.open('/contact-support.html', '_blank')}>
                  Contact Us
                </HeaderText>
                <HeaderButton onClick={handleGetStarted}>
                  Get Started
                  <span className="arrow-icon">
                    <FiArrowRight size={24} />
                  </span>
                </HeaderButton>
              </>
            )}
          </ButtonContainer>
        </NavHeader>

        {/* Main Content */}
        {children}

        <FooterContainer>
          <FooterText>© 2025 Squeak. All rights reserved.</FooterText>
        </FooterContainer>
      </PageContainer>
    </TransitionWrapper>)}
    </>
  );
}

export default BasicPage;