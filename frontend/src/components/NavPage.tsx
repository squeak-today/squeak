import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransitionWrapper } from './PageTransition';
import {
  PageContainer,
  LoadingOverlay,
  LoadingLogo,
  LoadingText,
  Spinner,
  Sidebar,
  NavButton,
  MainContent,
  HeaderLogo,
  LogoText,
  LogoContainer,
  MobileHeader,
  HamburgerIcon,
  MobileNav,
  CloseButton,
  MobileNavButton
} from '../styles/NavPageStyles';
import logo from '../assets/drawing_400.png';
import supabase from '../lib/supabase';

interface NavPageProps {
  children: ReactNode;
  isLoading?: boolean;
  showTeach?: boolean;
  showJoinClassroom?: boolean;
  initialActiveNav?: string;
}

function NavPage({ 
  children,
  initialActiveNav = 'learn',
  isLoading = false,
}: NavPageProps): JSX.Element {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<string>(initialActiveNav);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  const handleNavClick = (id: string, path: string) => {
    setActiveNav(id);
    if (isMobile) {
      setMobileNavOpen(false);
    }
    if (id === 'logout') {
      handleLogout();
      return;
    }
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <TransitionWrapper>
      <PageContainer>
        {isMobile ? (
          <>
            <MobileHeader>
              <LogoContainer onClick={handleLogoClick}>
                <HeaderLogo src={logo} alt="Squeak Logo" />
                <LogoText>Squeak</LogoText>
              </LogoContainer>
              <HamburgerIcon onClick={toggleMobileNav}>
                <span></span>
                <span></span>
                <span></span>
              </HamburgerIcon>
            </MobileHeader>
            <MobileNav $isOpen={mobileNavOpen}>
              <CloseButton onClick={toggleMobileNav}>&times;</CloseButton>
              <MobileNavButton
                className={activeNav === 'learn' ? 'active' : ''}
                onClick={() => handleNavClick('learn', '/learn')}
              >
                Learn
              </MobileNavButton>
              <MobileNavButton
                className={activeNav === 'profile' ? 'active' : ''}
                onClick={() => handleNavClick('profile', '/profile')}
              >
                Profile
              </MobileNavButton>
              <MobileNavButton
                className={activeNav === 'contact' ? 'active' : ''}
                onClick={() => window.open('/contact-support.html', '_blank')}
              >
                Contact Us
              </MobileNavButton>
              <MobileNavButton
                className={`${activeNav === 'logout' ? 'active' : ''} logout`}
                onClick={() => handleNavClick('logout', '/logout')}
              >
                Log Out
              </MobileNavButton>
            </MobileNav>
          </>
        ) : (
          <Sidebar>
            <LogoContainer onClick={handleLogoClick}>
              <HeaderLogo src={logo} alt="Squeak Logo" />
              <LogoText>Squeak</LogoText>
            </LogoContainer>
            
            <NavButton
              className={activeNav === 'learn' ? 'active' : ''}
              onClick={() => handleNavClick('learn', '/learn')}
            >
              Learn
            </NavButton>

            <NavButton
              className={activeNav === 'profile' ? 'active' : ''}
              onClick={() => handleNavClick('profile', '/profile')}
            >
              Profile
            </NavButton>

            <NavButton
              className={activeNav === 'contact' ? 'active' : ''}
              onClick={() => window.open('/contact-support.html', '_blank')}
            >
              Contact Us
            </NavButton>

            <NavButton
              className={`${activeNav === 'logout' ? 'active' : ''} logout`}
              onClick={() => handleNavClick('logout', '/logout')}
            >
              Log Out
            </NavButton>
          </Sidebar>
        )}
        <MainContent $isMobile={isMobile}>
          {isLoading ? (
            <LoadingOverlay>
              <LoadingLogo src={logo} alt="Squeak Logo" />
              <Spinner />
              <LoadingText>Loading...</LoadingText>
            </LoadingOverlay>
          ) : (
            children
          )}
        </MainContent>
      </PageContainer>
    </TransitionWrapper>
  );
}

export default NavPage;
