import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/AppLayout';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate();
  const { jwtToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !jwtToken) {
      navigate({ to: '/login', search: { mode: 'login' } });
    }
  }, [jwtToken, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(jwtToken);
  }

  if (!jwtToken) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Content goes here</p>
      </div>
    </AppLayout>
  );
}