import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/drawing_400.png';
import expandRight from '../assets/icons/expand-right.png';
import expandLeft from '../assets/icons/expand-left.png';
import logoutIcon from '../assets/icons/logout.png';
import graduationCap from '../assets/icons/graduation-cap.png';
import { useAuth } from '../context/AuthContext';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { 
  PageContainer,
  Sidebar,
  NavButton,
  ContactButton,
  MainContent,
  LoadingOverlay,
  LoadingLogo,
  LoadingText,
  Spinner,
  ToggleButton,
  ProfileContainer,
  ProfileIcon,
  UserName,
  ProfileWrapper,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
  DropdownTitle,
  DropdownSubtitle,
  ClassroomsList
} from '../styles/components/NavPageStyles';
import { theme } from '../styles/theme';

interface ClassroomType {
  id: string;
  name: string;
}

interface NavPageProps {
  children: ReactNode[];
  routes: {
    id: string;
    label: string;
  }[];
  initialActiveRoute?: string;
  isLoading?: boolean;
  classrooms?: ClassroomType[];
}

function NavPage({ 
  children,
  routes,
  initialActiveRoute,
  isLoading = false,
  classrooms = [
    { id: 'classroom1', name: 'Classroom 1' },
    { id: 'classroom2', name: 'Classroom 2' }
  ]
}: NavPageProps): React.ReactElement {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { getProfile } = useProfileAPI();
  const [activeRoute, setActiveRoute] = useState<string>(initialActiveRoute || routes[0]?.id || '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClassroomsExpanded, setIsClassroomsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        if (profileData) {
          setUserName(profileData.username || 'User');
        }
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [getProfile]);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const tabletBreakpoint = parseInt(theme.breakpoints.tablet.replace('px', ''));
      setIsCollapsed(window.innerWidth <= tabletBreakpoint);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const routeMap: Record<string, ReactNode> = {};
  React.Children.forEach(children, (child, index) => {
    if (React.isValidElement(child) && routes[index]) {
      routeMap[routes[index].id] = child;
    }
  });

  const handleNavClick = async (id: string) => {
    if (id === 'logout') {
      await logout();
      navigate('/');
      return;
    }
    setActiveRoute(id);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleClassroomsList = () => {
    setIsClassroomsExpanded(!isClassroomsExpanded);
  };

  const handleClassroomSelect = (classroomId: string) => {
    console.log(`Selected classroom: ${classroomId}`);
    setIsDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    setIsDropdownOpen(false);
  };

  const handleBillingClick = () => {
    console.log('Billing clicked');
    setIsDropdownOpen(false);
  };

  const handleContactClick = () => {
    window.open('/contact-support.html', '_blank');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const activeComponent = routeMap[activeRoute] || null;

  return (
    <PageContainer>
      <Sidebar collapsed={isCollapsed}>
        <ProfileWrapper collapsed={isCollapsed} ref={dropdownRef}>
          <ProfileContainer 
            collapsed={isCollapsed} 
            onClick={handleProfileClick}
          >
            {!isCollapsed && <ProfileIcon src={graduationCap} alt="Profile" />}
            {!isCollapsed && <UserName collapsed={isCollapsed}>{userName}</UserName>}
          </ProfileContainer>
          <ToggleButton onClick={toggleSidebar}>
            <img src={isCollapsed ? expandRight : expandLeft} alt={isCollapsed ? "Expand" : "Collapse"} />
          </ToggleButton>
          
          {!isCollapsed && (
            <DropdownMenu isOpen={isDropdownOpen}>
              <DropdownHeader>
                <DropdownTitle>{userName}</DropdownTitle>
                <DropdownSubtitle onClick={toggleClassroomsList}>
                  Switch Classrooms
                </DropdownSubtitle>
              </DropdownHeader>
              
              {isClassroomsExpanded && (
                <>
                  <ClassroomsList isExpanded={isClassroomsExpanded}>
                    {classrooms.map(classroom => (
                      <DropdownItem 
                        key={classroom.id} 
                        onClick={() => handleClassroomSelect(classroom.id)}
                      >
                        {classroom.name}
                      </DropdownItem>
                    ))}
                  </ClassroomsList>
                  
                  <DropdownDivider />
                </>
              )}
              
              <DropdownItem onClick={handleBillingClick}>
                Billing
              </DropdownItem>
              
              <DropdownItem onClick={handleSettingsClick}>
                Settings
              </DropdownItem>
            </DropdownMenu>
          )}
        </ProfileWrapper>
        
        {routes.map((route) => (
          <NavButton
            key={route.id}
            className={activeRoute === route.id ? 'active' : ''}
            onClick={() => handleNavClick(route.id)}
            collapsed={isCollapsed}
          >
            {isCollapsed ? route.label.charAt(0) : route.label}
          </NavButton>
        ))}

        <NavButton
          className="logout"
          onClick={() => handleNavClick('logout')}
          collapsed={isCollapsed}
        >
          <img src={logoutIcon} alt="Logout" />
          {!isCollapsed && "Log Out"}
        </NavButton>
        
        <ContactButton 
          onClick={handleContactClick} 
          collapsed={isCollapsed}
        >
          {isCollapsed ? '?' : 'Contact Us'}
        </ContactButton>
      </Sidebar>
      <MainContent>
        {isLoading ? (
          <LoadingOverlay>
            <LoadingLogo src={logo} alt="Squeak Logo" />
            <Spinner />
            <LoadingText>Loading...</LoadingText>
          </LoadingOverlay>
        ) : (
          activeComponent
        )}
      </MainContent>
    </PageContainer>
  );
}

export default NavPage;
