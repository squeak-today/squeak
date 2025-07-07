import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { jwtToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !jwtToken) {
      navigate({ to: '/login', search: { mode: 'login' } });
    }
  }, [jwtToken, isLoading, navigate]);

  if (!jwtToken) {
    return null;
  }

  return <>{children}</>;
}