import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/drawing_400.png';
import expandRight from '../assets/icons/expand-right.png';
import expandLeft from '../assets/icons/expand-left.png';
import logoutIcon from '../assets/icons/logout.png';
import graduationCap from '../assets/icons/graduation-cap.png';
import billingIcon from '../assets/icons/billing.png';
import settingsIcon from '../assets/icons/settings.png';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
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
  children: ReactNode;
  isLoading?: boolean;
  classrooms?: ClassroomType[];
}

const navRoutes = [
  { id: 'home', label: 'Home', path: '/' }
];

function NavPage({ 
  children,
  isLoading = false,
  classrooms = [
    { id: 'classroom1', name: 'Classroom 1' },
    { id: 'classroom2', name: 'Classroom 2' }
  ]
}: NavPageProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { profileUsername, isProfileLoading, isSidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClassroomsExpanded, setIsClassroomsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const getActiveRouteFromPath = () => {
    const path = location.pathname;
    const currentRoute = navRoutes.find(route => route.path === path);
    return currentRoute?.id;
  };
  
  useEffect(() => {
    const handleResize = () => {
      const tabletBreakpoint = parseInt(theme.breakpoints.tablet.replace('px', ''));
      setSidebarCollapsed(window.innerWidth <= tabletBreakpoint);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

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

  const handleNavClick = async (routeId: string) => {
    if (routeId === 'logout') {
      await logout();
      navigate('/auth');
      return;
    }

    if (routeId === 'settings') {
      navigate('/settings');
      return;
    }
    
    const route = navRoutes.find(r => r.id === routeId);
    if (route) {
      navigate(route.path);
    }
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
    navigate('/settings');
    setIsDropdownOpen(false);
  };

  const handleBillingClick = () => {
    navigate('/settings');
    setIsDropdownOpen(false);
  };

  const handleContactClick = () => {
    window.open('/contact-support.html', '_blank');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const activeRoute = getActiveRouteFromPath();

  return (
    <PageContainer>
      <Sidebar collapsed={isSidebarCollapsed}>
        <ProfileWrapper collapsed={isSidebarCollapsed} ref={dropdownRef}>
          <ProfileContainer 
            collapsed={isSidebarCollapsed} 
            onClick={handleProfileClick}
          >
            {!isSidebarCollapsed && <ProfileIcon src={graduationCap} alt="Profile" />}
            {!isSidebarCollapsed && <UserName collapsed={isSidebarCollapsed}>{profileUsername}</UserName>}
          </ProfileContainer>
          <ToggleButton onClick={toggleSidebar}>
            <img src={isSidebarCollapsed ? expandRight : expandLeft} alt={isSidebarCollapsed ? "Expand" : "Collapse"} />
          </ToggleButton>
          
          {!isSidebarCollapsed && (
            <DropdownMenu isOpen={isDropdownOpen}>
              <DropdownHeader>
                <DropdownTitle>{profileUsername}</DropdownTitle>
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
                <img src={billingIcon} alt="Billing" style={{ width: '16px', marginRight: '8px' }} />
                Billing
              </DropdownItem>
              
              <DropdownItem onClick={handleSettingsClick}>
                <img src={settingsIcon} alt="Settings" style={{ width: '16px', marginRight: '8px' }} />
                Settings
              </DropdownItem>
            </DropdownMenu>
          )}
        </ProfileWrapper>
        
        {navRoutes.map((route) => (
          <NavButton
            key={route.id}
            className={activeRoute === route.id ? 'active' : ''}
            onClick={() => handleNavClick(route.id)}
            collapsed={isSidebarCollapsed}
          >
            {isSidebarCollapsed ? route.label.charAt(0) : route.label}
          </NavButton>
        ))}
        
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          {isSidebarCollapsed && (
            <NavButton
              className={location.pathname === '/settings' ? 'active' : ''}
              onClick={() => handleNavClick('settings')}
              collapsed={isSidebarCollapsed}
            >
              <img src={settingsIcon} alt="Settings" />
            </NavButton>
          )}

          <NavButton
            className="logout"
            onClick={() => handleNavClick('logout')}
            collapsed={isSidebarCollapsed}
          >
            <img src={logoutIcon} alt="Logout" />
            {!isSidebarCollapsed && "Log Out"}
          </NavButton>
          
          <ContactButton 
            onClick={handleContactClick} 
            collapsed={isSidebarCollapsed}
          >
            {isSidebarCollapsed ? '?' : 'Contact Us'}
          </ContactButton>
        </div>
      </Sidebar>
      <MainContent>
        {isLoading || isProfileLoading ? (
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
  );
}

export default NavPage;
