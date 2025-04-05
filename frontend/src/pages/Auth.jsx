import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import { Subtitle } from '../components/StyledComponents';
import { AuthBox, AuthContainer, AuthForm, AuthInput, AuthButton, AuthToggle, AuthTitle, ToggleButton, AuthText, Slider, ToggleContainer } from '../styles/AuthPageStyles';
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';

import { useProfileAPI } from '../hooks/useProfileAPI';

function Auth() {
    const { mode } = useParams();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);
    const { showNotification } = useNotification();

    const { getProfile } = useProfileAPI();

    const apiBase = import.meta.env.VITE_API_BASE;


    const toggleMode = (newMode) => {
        setIsLogin(newMode === 'login');
        navigate(`/auth/${newMode}`);
    };


    useEffect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
				navigate('/auth/reset');
				return;
            }
        });

        if (mode !== 'reset') {
          supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session) {
              try {
                await getProfile();
              } catch (error) {
                navigate('/welcome');
              }
            }
          });
        }
    }, [navigate, mode, apiBase]);

    useEffect(() => {
        setIsLogin(mode === 'login');
        setSignupSuccess(false);
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
            console.log("SIGNUP")
            const { data, error } = await supabase.auth.signUp({
              email, password,
              options: {
                emailRedirectTo: `${window.location.origin}/welcome`,
              }
            });
      
            // for disabled email confirmation, we get an error with a message like "User already registered".
            if (error) {
              if (error.message.toLowerCase().includes("already registered")) {
                showNotification(
                  "An account with this email already exists. Please log in.",
                  "error"
                );
                toggleMode('login');
              } else {
                showNotification(error.message, "error");
              }
              return;
            }

            // for enabled email confirmation, a fake user obj is returned so we check validity
            if (data?.user) {
              const user = data.user;
              if (user.identities && user.identities.length === 0) {
                showNotification(
                  "An account with this email already exists. Log in instead! " +
                  "If you haven’t verified your email, please check your inbox (or spam folder) for a verification link.",
                  "error"
                );
                toggleMode('login');
                return;
              }
            }
            setSignupSuccess(true);
          }
        } catch (error) {
          console.error("Auth error:", error);
          showNotification("Authentication error. Please try again.", "error");
        } finally {
          setLoading(false);
        }
      };
      

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset`,
            });
            if (error) throw error;
            showNotification('Check your email for password reset instructions!', 'success');
            setShowResetForm(false);
            setEmail('');
        } catch (error) {
            showNotification(error.message || 'Failed to send reset email', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ 
                password: password 
            });
            if (error) { showNotification(error.message, 'error'); throw error; };
            showNotification('Password updated successfully!', 'success');
            setShowResetForm(false);
            setPassword('');
            navigate('/auth/login');
        } catch (error) {
            showNotification(error.message || 'Failed to update password', 'error');
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
                        <AuthText>We’ve just sent a verification link to <strong>{email}</strong>.</AuthText>
                        <AuthText>If you don’t see it in your inbox, don’t forget to check your junk or spam folder.</AuthText>
                        <AuthText>Still having trouble?</AuthText>
                        <AuthText>
                            <a href="/contact-support.html" target="_blank" rel="noopener noreferrer">
                                    Contact our support team
                            </a>.
                        </AuthText>
                        <AuthButton onClick={() => navigate('/')}>
                            Return Home
                        </AuthButton>
                    </AuthContainer>
                </AuthBox>
            </BasicPage>
        );
    }

    // since password reset redirects to /, which redirects to /auth/reset if the event is PASSWORD_RECOVERY.
    if (mode === 'reset') {
        return (
            <BasicPage>
                <AuthBox>
                    <AuthContainer>
                        <Subtitle>Set New Password</Subtitle>
                        <AuthForm onSubmit={handlePasswordUpdate}>
                            <AuthInput
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <AuthButton type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </AuthButton>
                        </AuthForm>
                    </AuthContainer>
                </AuthBox>
            </BasicPage>
        );
    }

    if (showResetForm === 'request') {
        return (
            <BasicPage>
                <AuthBox>
                    <AuthContainer>
                        <Subtitle>Reset Password</Subtitle>
                        <AuthForm onSubmit={handleResetRequest}>
                            <AuthInput
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <AuthButton type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </AuthButton>
                        </AuthForm>
                        <AuthToggle onClick={() => setShowResetForm(false)}>
                            Back to Login
                        </AuthToggle>
                    </AuthContainer>
                </AuthBox>
            </BasicPage>
        );
    }

    return (
        <BasicPage>
          <AuthBox>
            <AuthContainer>
              {isLogin ? (
                <AuthTitle>Welcome Back!</AuthTitle>
              ) : (
                <AuthTitle>Create Account</AuthTitle>
              )}
    
              {/* 
                Sliding Toggle:
                1) The Slider is absolutely positioned & slides based on “isLogin”.
                2) Two ToggleButtons on top that change “isLogin”.
              */}
              <ToggleContainer>
                <Slider isLogin={isLogin} />
                <ToggleButton
                  active={!isLogin}
                  onClick={() => toggleMode('signup')}
                >
                  Sign Up
                </ToggleButton>
                <ToggleButton
                  active={isLogin}
                  onClick={() => toggleMode('login')}
                >
                  Login
                </ToggleButton>
              </ToggleContainer>
    
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
                  {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
                </AuthButton>
              </AuthForm>
    
              {/* Forgot password or toggle link */}
              {isLogin ? (
                <AuthToggle onClick={() => setShowResetForm('request')}>
                  Forgot password?
                </AuthToggle>
              ) : null}
    
              <AuthToggle onClick={() => toggleMode(isLogin ? 'signup' : 'login')}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </AuthToggle>
            </AuthContainer>
          </AuthBox>
        </BasicPage>
      );
    }

export default Auth; 