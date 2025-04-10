import React, { useState } from 'react';
import { TransitionWrapper } from './PageTransition';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi'; 
import { AiOutlineMenu } from 'react-icons/ai';  // hamburger/waffle icon
import SectionNav from './SectionNav';

interface Section {
  label: string;
  href: string;
}

interface BasicPageProps {
  children: React.ReactNode;
  showLogout?: boolean;
  onLogout?: () => void;
  showGetStarted?: boolean;
  showTeach?: boolean;
  showJoinClassroom?: boolean;
  isLoading?: boolean;
  sections?: Section[];
  showSectionNav?: boolean;
}

const BasicPage: React.FC<BasicPageProps> = ({ 
  children, 
  showLogout = false, 
  onLogout = () => {}, 
  showGetStarted = false, 
  showTeach = false,
  showJoinClassroom = false,
  isLoading = false,
  sections = [],
  showSectionNav = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <NavHeader className="flex items-center justify-between">
          <div className="flex items-center">
            <HeaderLogo
              src={logo}
              alt="Squeak Logo"
              onClick={() => navigate('/')}
            />
            <LogoText onClick={() => navigate('/')}>Squeak</LogoText>
          </div>
          
          {showSectionNav && sections.length > 0 && (
            <div className="hidden md:flex items-center justify-center flex-1 mx-4">
              <SectionNav 
                route={location.pathname} 
                sections={sections} 
                className="mb-0 py-0 border-0 w-full flex-1 flex justify-center" 
              />
            </div>
          )}
          
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
                  Contact
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
              {showSectionNav && sections.length > 0 && (
                <div className="pb-2 mb-2 border-b border-border">
                  {sections.map((section) => (
                    <MenuText
                      key={section.label}
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('section', section.href);
                        window.history.pushState({}, '', url.toString());
                        
                        const element = document.getElementById(section.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                        
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {section.label}
                    </MenuText>
                  ))}
                </div>
              )}
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
                Contact
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
                  Contact
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

        {/* Mobile Section Nav */}
        {showSectionNav && sections.length > 0 && (
          <div className="md:hidden mb-4 flex justify-center">
            <SectionNav 
              route={location.pathname} 
              sections={sections} 
            />
          </div>
        )}

        {/* Main Content */}
        {children}
        
      </PageContainer>
    </TransitionWrapper>)}
    </>
  );
};

export default BasicPage;