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
  showJoinClassroom?: boolean;
  initialActiveNav?: string;
}

function NavPage({ 
  children,
  initialActiveNav = 'learn',
  isLoading = false,
  showTeach = false,
  showJoinClassroom = false
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
          
          <NavButton
            className={activeNav === 'learn' ? 'active' : ''}
            onClick={() => handleNavClick('learn', '/learn')}
          >
            Learn
          </NavButton>

          {showTeach && (
            <NavButton
              className={activeNav === 'teach' ? 'active' : ''}
              onClick={() => handleNavClick('teach', '/teacher')}
            >
              Teach
            </NavButton>
          )}

          {showJoinClassroom && (
            <NavButton
              className={activeNav === 'join-class' ? 'active' : ''}
              onClick={() => handleNavClick('join-class', '/student/become')}
            >
              Join Class
            </NavButton>
          )}

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