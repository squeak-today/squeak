import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { jwtToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !jwtToken) {
      navigate({ to: '/login', search: { mode: 'login' } });
    }
  }, [jwtToken, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  if (!jwtToken) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;