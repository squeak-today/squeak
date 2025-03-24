// Modified NavPage.tsx
import { ReactNode, useState } from 'react';
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
  LogoContainer
} from '../styles/NavPageStyles';
import logo from '../assets/drawing_400.png';
import supabase from '../lib/supabase';

interface NavPageProps {
  children: ReactNode;
  isLoading?: boolean;
  showTeach?: boolean;
  isTeacher?: boolean; // New prop to identify teacher dashboard
  showJoinClassroom?: boolean;
  initialActiveNav?: string;
}

function NavPage({ 
  children,
  initialActiveNav = 'learn',
  isLoading = false,
  isTeacher = false, // Default to false
}: NavPageProps): JSX.Element {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<string>(initialActiveNav);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  const handleNavClick = (id: string, path: string) => {
    setActiveNav(id);
    if (id === 'logout') {
      handleLogout();
      return;
    }
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <TransitionWrapper>
      <PageContainer>
        <Sidebar>
          <LogoContainer onClick={handleLogoClick}>
            <HeaderLogo src={logo} alt="Squeak Logo" />
            <LogoText>Squeak</LogoText>
          </LogoContainer>
          
          {isTeacher ? (
            // Teacher-specific navigation
            <>
              <NavButton
                className={activeNav === 'dashboard' ? 'active' : ''}
                onClick={() => handleNavClick('dashboard', '/teacher/dashboard')}
              >
                Dashboard
              </NavButton>
              
              <NavButton
                className={activeNav === 'analytics' ? 'active' : ''}
                onClick={() => handleNavClick('analytics', '/teacher/analytics')}
              >
                Analytics
              </NavButton>
              
              <NavButton
                className={activeNav === 'content' ? 'active' : ''}
                onClick={() => handleNavClick('content', '/teacher/content')}
              >
                Moderate Stories
              </NavButton>
              
              <NavButton
                className={activeNav === 'students' ? 'active' : ''}
                onClick={() => handleNavClick('students', '/teacher/students')}
              >
                Student Profiles
              </NavButton>
            </>
          ) : (
            // Standard user navigation
            <>
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
            </>
          )}

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
        <MainContent>
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