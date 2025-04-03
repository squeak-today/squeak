import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransitionWrapper } from './PageTransition';
import { usePlatform } from '../context/PlatformContext';
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
  MobileNavButton,
  DashboardLink,
  MobileDashboardLink,
  PremiumPanel,
  PremiumTitle,
  PremiumSubtitle,
  PremiumButton,
  MobilePremiumPanel
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
  const { isTeacher, isStudent, plan } = usePlatform();

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

  const handleDashboardClick = () => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173'
      : 'https://dashboard.squeak.today';
    
    window.open(baseUrl, '_blank');
  };

  const handleGetPremiumClick = () => {
    navigate('/profile/get-premium');
  };

  const renderPremiumPanel = () => {
    if (plan !== 'FREE') return null;
    
    if (isMobile) {
      return (
        <MobilePremiumPanel>
          <PremiumTitle>Squeak Premium</PremiumTitle>
          <PremiumSubtitle>All features, unlimited usage. Try for 7 days!</PremiumSubtitle>
          <PremiumButton onClick={handleGetPremiumClick}>
            GET PREMIUM
          </PremiumButton>
        </MobilePremiumPanel>
      );
    }
    
    return (
      <PremiumPanel>
        <PremiumTitle>Squeak Premium</PremiumTitle>
        <PremiumSubtitle>All features, unlimited usage. Try for 7 days!</PremiumSubtitle>
        <PremiumButton onClick={handleGetPremiumClick}>
          GET PREMIUM
        </PremiumButton>
      </PremiumPanel>
    );
  };

  const renderDashboardLink = () => {
    if (isTeacher) {
      return (
        <>
          {isMobile ? (
            <MobileDashboardLink onClick={handleDashboardClick}>
              View Dashboard
            </MobileDashboardLink>
          ) : (
            <DashboardLink onClick={handleDashboardClick}>
              View Dashboard
            </DashboardLink>
          )}
        </>
      );
    } else if (!isStudent && !isTeacher) {
      return (
        <>
          {isMobile ? (
            <MobileDashboardLink onClick={() => navigate('/student/become')}>
              Join a Classroom
            </MobileDashboardLink>
          ) : (
            <DashboardLink onClick={() => navigate('/student/become')}>
              Join a Classroom
            </DashboardLink>
          )}
        </>
      );
    }
    
    return null;
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
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {renderPremiumPanel()}
              </div>
              {renderDashboardLink()}
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
            
            <div style={{ flexGrow: 1 }}></div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {renderPremiumPanel()}
            </div>
            {renderDashboardLink()}
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
