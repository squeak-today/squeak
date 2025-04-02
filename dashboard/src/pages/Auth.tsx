import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AuthContainer,
  AuthBox,
  Title,
  AuthForm,
  AuthInput,
  AuthButton,
  AuthToggle
} from '../styles/AuthPageStyles';
import LoadingScreen from '../components/LoadingScreen';
import { TransitionWrapper } from '../styles/PageTransition';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { useOrganizationAPI } from '../hooks/useOrganizationAPI';
import supabase from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

function Auth() {
  const { org_id } = useParams<{ org_id?: string }>();
  const navigate = useNavigate();
  const { getProfile } = useProfileAPI();
  const { getOrganization } = useOrganizationAPI();
  const { jwtToken, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!jwtToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        await getProfile();
      } catch (error) {
        console.error('Error checking profile:', error);
        setIsLoading(false);
      } finally {
        navigate(org_id ? `/org/${org_id}` : '/org');
      }
    };
    
    if (!authLoading) {
      checkUserStatus();
    }
  }, [jwtToken, authLoading, navigate, getProfile, getOrganization, org_id]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      showNotification('Successfully logged in!', 'success');
      
      try {
        await getProfile();
        navigate(org_id ? `/org/${org_id}` : '/org');
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        showNotification(error.message || 'Authentication error. Please try again.', 'error');
      } else {
        showNotification('Authentication error. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <TransitionWrapper $isLeaving={false}>
      <AuthContainer>
        <AuthBox>
          <Title>Login</Title>
          <AuthForm onSubmit={handleLogin}>
            <AuthInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <AuthInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <AuthButton type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </AuthButton>
          </AuthForm>
          <AuthToggle>
            Don't have an account? Make one at squeak.today first!
          </AuthToggle>
        </AuthBox>
      </AuthContainer>
    </TransitionWrapper>
  );
}

export default Auth; 