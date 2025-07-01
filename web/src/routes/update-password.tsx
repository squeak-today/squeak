import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/context/NotificationContext';
import supabase from '@/lib/supabase';

export const Route = createFileRoute('/update-password')({
  component: UpdatePassword,
})

function UpdatePassword() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        // Wait for the session to be established from URL fragments
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Password reset session check:', session?.access_token ? 'present' : 'missing');
        
        if (!mounted) return;
        
        if (session) {
          setSessionReady(true);
        } else {
          setSessionError(true);
          showNotification('Invalid or expired password reset link. Please request a new one.', 'error');
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setSessionError(true);
          showNotification('Error validating reset link. Please try again.', 'error');
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Update password auth state change:', event, session?.access_token ? 'token present' : 'no token');
      
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('Password recovery session established');
        if (mounted) {
          setSessionReady(true);
          setSessionError(false);
        }
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [showNotification]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      // Double-check session before updating
      const { data: { session } } = await supabase.auth.getSession();
      
             if (!session) {
         showNotification('Session expired. Please request a new password reset link.', 'error');
         navigate({ to: '/login', search: { mode: 'login' } });
         return;
       }

      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (error) {
        console.error('Password update error:', error);
        if (error.message.includes('session_not_found') || 
            error.message.includes('invalid_session') ||
            error.message.includes('JWT')) {
          showNotification('Session expired. Please request a new password reset link.', 'error');
          navigate({ to: '/login', search: { mode: 'login' } });
        } else {
          showNotification(error.message, 'error');
        }
        return;
      }
      
      showNotification('Password updated successfully!', 'success');
      
      // Sign out the user so they can sign in with their new password
      await supabase.auth.signOut();
      
             // Navigate to login
       navigate({ to: '/login', search: { mode: 'login' } });
      
    } catch (error: any) {
      console.error('Password update error:', error);
      showNotification(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Please request a new password reset link to continue.</p>
              </div>
                             <Button 
                 onClick={() => navigate({ to: '/login', search: { mode: 'login' } })}
                 className="w-full"
               >
                 Back to Login
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>
                Validating your password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 