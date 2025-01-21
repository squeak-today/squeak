import { TransitionWrapper } from './PageTransition';
import {
  NavHeader,
  HeaderLogo,
  PictureLogo,
  Footer,
  MiscButton,
  ButtonContainer,
  PageContainer,
} from './StyledComponents'; // Updated import
import logo from '../assets/logo.png';
import headerLogo from '../assets/drawing_400.png';
import { useNavigate } from 'react-router-dom';

function BasicPage({ children, showLogout, onLogout }) {
  const navigate = useNavigate();

  return (
    <TransitionWrapper>
      <PageContainer>
        <NavHeader>
          <HeaderLogo
            src={logo}
            alt="Squeak"
            onClick={() => navigate('/')}
          />
          <PictureLogo src={headerLogo} alt="Squeak Mouse" />
          
          <ButtonContainer>
            <MiscButton
              as="a"
              href="https://forms.gle/LumHWSYaqLKV4KMa8"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tell Us Anything! ❤️
            </MiscButton>
            {showLogout && (
              <MiscButton onClick={onLogout}>Logout</MiscButton>
            )}
          </ButtonContainer>
        </NavHeader>

        {/* Main Content */}
        {children}

        <Footer>© 2024 Squeak. All rights reserved.</Footer>
      </PageContainer>
    </TransitionWrapper>
  );
}

export default BasicPage;
