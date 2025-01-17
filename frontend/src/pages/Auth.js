import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import { Subtitle } from '../components/StyledComponents';
import { AuthBox, AuthContainer, AuthForm, AuthInput, AuthButton, AuthToggle } from '../styles/AuthPageStyles';
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';

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
                if (error) { showNotification(error.message, 'error'); throw error; }
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
            <BasicPage>
                <AuthBox>
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
                </AuthBox>
            </BasicPage>
        );
    }

    return (
        <BasicPage>
            <AuthBox>
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
            </AuthBox>
        </BasicPage>
    );
}

export default Auth; 