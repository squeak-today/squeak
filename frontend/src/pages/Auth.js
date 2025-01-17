import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { BrowserBox, Subtitle, NavHeader, HeaderLogo, PictureLogo, Footer, MiscButton } from '../components/StyledComponents';
import { AuthContainer, AuthForm, AuthInput, AuthButton, AuthToggle } from '../styles/AuthPageStyles';
import { TransitionWrapper } from '../components/PageTransition';
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/logo.png';
import headerLogo from '../assets/drawing_400.png';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Auth() {
    const { mode } = useParams();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/learn');
            }
        });
    }, [navigate]);

    useEffect(() => {
        setIsLogin(mode === 'login');
        setSignupSuccess(false); // reset success state when switching modes
    }, [mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/learn');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                setSignupSuccess(true);
            }
        } catch (error) {
            console.error('Auth error:', error);
            showNotification('Authentication error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (signupSuccess) {
        return (
            <TransitionWrapper>
                <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
                    <NavHeader>
                        <HeaderLogo 
                            src={logo} 
                            alt="Squeak" 
                            onClick={() => navigate('/')} 
                        />
                        <PictureLogo src={headerLogo} alt="Squeak Mouse" />
                        <MiscButton 
                            as="a"
                            href="https://forms.gle/LumHWSYaqLKV4KMa8"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Tell Us Anything! ❤️
                        </MiscButton>
                    </NavHeader>

                    <BrowserBox>
                        <AuthContainer>
                            <Subtitle>Check Your Email!</Subtitle>
                            <p style={{ textAlign: 'center', fontFamily: 'Noto Serif, serif' }}>
                                We've sent you a verification link to {email}.<br/>
                                Please verify your email to start learning with Squeak!
                            </p>
                            <AuthButton onClick={() => navigate('/')}>
                                Return Home
                            </AuthButton>
                        </AuthContainer>
                    </BrowserBox>

                    <Footer>
                        © 2024 Squeak. All rights reserved.
                    </Footer>
                </div>
            </TransitionWrapper>
        );
    }

    return (
        <TransitionWrapper>
            <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
                <NavHeader>
                    <HeaderLogo 
                        src={logo} 
                        alt="Squeak" 
                        onClick={() => navigate('/')} 
                    />
                    <PictureLogo src={headerLogo} alt="Squeak Mouse" />
                    <MiscButton 
                        as="a"
                        href="https://forms.gle/LumHWSYaqLKV4KMa8"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Tell Us Anything! ❤️
                    </MiscButton>
                </NavHeader>

                <BrowserBox>
                    <AuthContainer>
                        <Subtitle>
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </Subtitle>
                        <AuthForm onSubmit={handleSubmit}>
                            <AuthInput
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <AuthInput
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <AuthButton type="submit" disabled={loading}>
                                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </AuthButton>
                        </AuthForm>
                        <AuthToggle onClick={() => navigate(isLogin ? '/auth/signup' : '/auth/login')}>
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </AuthToggle>
                    </AuthContainer>
                </BrowserBox>

                <Footer>
                    © 2024 Squeak. All rights reserved.
                </Footer>
            </div>
        </TransitionWrapper>
    );
}

export default Auth; 