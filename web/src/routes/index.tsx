import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate();
  const { jwtToken, isLoading, logout } = useAuth();

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

  if (!jwtToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={logout} variant="outline">
        Logout
      </Button>
    </div>
  )
}