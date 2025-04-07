// Auth.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import {
  AuthBox,
  AuthContainer,
  AuthTitle,
  SocialButton,
  Separator,
  SeparatorText,
  AuthForm,
  AuthInput,
  AuthButton,
  AuthLink,
  GoogleIcon,
  AppleIcon
} from '../styles/AuthPageStyles'; // or wherever you keep them
import BasicPage from '../components/BasicPage';
import { useNotification } from '../context/NotificationContext';
import { useProfileAPI } from '../hooks/useProfileAPI';

function Auth() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { getProfile } = useProfileAPI();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  // For simplicity, treat 'login' vs 'signup' vs 'reset' similarly to your existing code
  const isLogin = mode === 'login';

  // Social Sign-In (Google) example
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/welcome`,
      },
    });
    if (error) showNotification(error.message, 'error');
  };

  // Social Sign-In (Apple) example
  const handleAppleSignIn = async () => {
    // You’d need to configure Apple in Supabase for this to work
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/welcome`,
      },
    });
    if (error) showNotification(error.message, 'error');
  };

  useEffect(() => {
    // Check session or handle password reset flows, etc.
    // ...
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/learn');
      } else {
        // sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
          },
        });
        if (error) throw error;
        setSignupSuccess(true);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Example "forgot password" flow
  const handleForgotPassword = () => {
    // Show your reset form or navigate to /auth/reset
    navigate('/auth/reset');
  };

  if (signupSuccess) {
    return (
      <BasicPage>
        <AuthBox>
          <AuthContainer>
            <AuthTitle>Check Your Email!</AuthTitle>
            <p>
              We sent a verification link to <strong>{email}</strong>.
              If you don’t see it, check your spam folder.
            </p>
            <AuthButton onClick={() => navigate('/')}>Return Home</AuthButton>
          </AuthContainer>
        </AuthBox>
      </BasicPage>
    );
  }

  return (
    <BasicPage>
      <AuthBox>
        <AuthContainer>
          <AuthTitle>{isLogin ? 'Welcome Back!' : 'Create an Account'}</AuthTitle>

          {/* Social Logins */}
    
          <SocialButton onClick={handleAppleSignIn}>
            <AppleIcon /> Login with Apple
          </SocialButton>
         
          {/*<SocialButton onClick={handleGoogleSignIn}>
            <GoogleIcon /> Login with Google
          </SocialButton>*/}

          {/* Separator */}
          <Separator>
            <SeparatorText>Or continue with</SeparatorText>
          </Separator>

          {/* Email/Password Form */}
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

            {/* Forgot Password */}
            {isLogin && (

            <AuthLink type="button" onClick={handleForgotPassword}>
              Forgot your password?
            </AuthLink>
            )}

            <AuthButton type="submit" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </AuthButton>
          </AuthForm>

          {/* Toggle between Login / Signup */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            {isLogin ? (
              <>
                Don’t have an account?{' '}
                <AuthLink type="button" onClick={() => navigate('/auth/signup')}>
                  Sign up
                </AuthLink>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <AuthLink type="button" onClick={() => navigate('/auth/login')}>
                  Login
                </AuthLink>
              </>
            )}
          </div>
        </AuthContainer>
      </AuthBox>
    </BasicPage>
  );
}

export default Auth;
