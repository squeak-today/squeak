import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import { Subtitle } from '../components/StyledComponents';
import {
  AuthBox,
  AuthContainer,
  AuthForm,
  AuthInput,
  AuthButton,
  AuthToggle,
  AuthTitle,
  ToggleButton,
  AuthText,
  Slider,
  ToggleContainer,
} from '../styles/AuthPageStyles';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';

function TeacherAuth() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const { showNotification } = useNotification();

  const apiBase = process.env.REACT_APP_API_BASE;

  // Toggle between login and signup modes
  const toggleMode = (newMode) => {
    setIsLogin(newMode === 'login');
    navigate(`/teacher/auth/${newMode}`);
  };

  // Check for an active session and teacher status only once when the component mounts (or mode changes)
  useEffect(() => {
    // Listen for password recovery events.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate('/teacher/auth/reset');
      }
    });

    if (mode !== 'reset') {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          try {
            const jwt = session.access_token;
            const response = await fetch(`${apiBase}teacher`, {
              headers: { 'Authorization': `Bearer ${jwt}` },
            });
            const data = await response.json();
            // Note: Your backend returns { exists: true/false }
            if (!data.exists) {
              // Instead of looping back to login, send the user to a page where they can become a teacher.
              showNotification("This account is not yet a teacher. Please create a classroom to become a teacher.", "error");
              navigate('/teacher/become');
              return;
            }
            // Teacher exists, so redirect to the dashboard.
            navigate('/teacher/dashboard');
          } catch (error) {
            console.error("Error fetching teacher profile:", error);
            navigate('/teacher/auth/signup'); // Or navigate to an error/info page.
          }
        }
      });
    }
    // Cleanup the auth listener when component unmounts.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, mode, apiBase, showNotification]);

  // Update login mode when the URL parameter changes.
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
        // The onAuthStateChange useEffect will handle redirection.
      } else {
        // Sign up as a teacher.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
  
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
  
        if (data?.user) {
          // Optionally, wait for email confirmation.
          const session = data.session;
          if (session) {
            const jwt = session.access_token;
            // Create a classroom for the teacher.
            const res = await fetch(`${apiBase}teacher/classroom/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
              },
              body: JSON.stringify({ students_count: 0 }),
            });
  
            if (!res.ok) {
              const errorData = await res.json();
              showNotification(
                errorData.error || "Failed to create classroom",
                "error"
              );
              return;
            }
          }
          setSignupSuccess(true);
        }
      }
    } catch (error) {
      console.error("Teacher Auth error:", error);
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
        redirectTo: `${window.location.origin}/teacher/auth/reset`,
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
        password,
      });
      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      showNotification('Password updated successfully!', 'success');
      setShowResetForm(false);
      setPassword('');
      navigate('/teacher/auth/login');
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
            <AuthText>
              We’ve just sent a verification link to <strong>{email}</strong>.
            </AuthText>
            <AuthText>
              If you don’t see it in your inbox, don’t forget to check your junk or spam folder.
            </AuthText>
            <AuthText>Still having trouble?</AuthText>
            <AuthText>
              <a href="/contact-support.html" target="_blank" rel="noopener noreferrer">
                Contact our support team
              </a>.
            </AuthText>
            <AuthButton onClick={() => navigate('/')}>Return Home</AuthButton>
          </AuthContainer>
        </AuthBox>
      </BasicPage>
    );
  }

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
            <AuthToggle onClick={() => setShowResetForm(false)}>Back to Login</AuthToggle>
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
            <AuthTitle>Welcome Back, Teacher!</AuthTitle>
          ) : (
            <AuthTitle>Create Teacher Account</AuthTitle>
          )}

          <ToggleContainer>
            <Slider isLogin={isLogin} />
            <ToggleButton active={!isLogin} onClick={() => toggleMode('signup')}>
              Sign Up
            </ToggleButton>
            <ToggleButton active={isLogin} onClick={() => toggleMode('login')}>
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

          {isLogin && (
            <AuthToggle onClick={() => setShowResetForm('request')}>
              Forgot password?
            </AuthToggle>
          )}

          <AuthToggle onClick={() => toggleMode(isLogin ? 'signup' : 'login')}>
            {isLogin
              ? "Don't have an account? Sign up as a teacher"
              : 'Already have an account? Login as a teacher'}
          </AuthToggle>
        </AuthContainer>
      </AuthBox>
    </BasicPage>
  );
}

export default TeacherAuth;