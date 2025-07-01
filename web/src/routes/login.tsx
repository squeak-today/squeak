import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/context/NotificationContext';
import supabase from '@/lib/supabase';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as string) || 'login',
    }
  },
  component: Login,
})

function Login() {
  const navigate = useNavigate();
  const { jwtToken, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const { mode } = useSearch({ from: '/login' });
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showResetForm, setShowResetForm] = useState<boolean | 'request'>(false);

  useEffect(() => {
    setIsLogin(mode === 'login');
    
    if (mode === 'update-password') {
      setShowResetForm(true);
    }
  }, [mode]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetForm(true);
        return;
      }
      
      if (event === 'SIGNED_IN' && session && mode !== 'update-password') {
        navigate({ to: '/' });
      }
    });

    if (mode === 'update-password') {
      setTimeout(() => {
        if (!jwtToken) {
          showNotification('Session expired. Please request a new password reset link.', 'error');
          navigate({ to: '/login', search: { mode: 'login' } });
        } else {
          setShowResetForm(true);
        }
      }, 100);
    } else if (!isLoading && jwtToken && (mode === 'login' || mode === 'signup')) {
      navigate({ to: '/' });
    }

    return () => authListener.subscription.unsubscribe();
  }, [navigate, isLoading, jwtToken, mode, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: '/' });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            showNotification(
              "An account with this email already exists. Please log in.",
              "error"
            );
            setIsLogin(true);
          } else {
            showNotification(error.message, "error");
          }
          return;
        }

        if (data?.user) {
          const user = data.user;
          if (user.identities && user.identities.length === 0) {
            showNotification(
              "An account with this email already exists. Log in instead! " +
              "If you haven't verified your email, please check your inbox (or spam folder) for a verification link.",
              "error"
            );
            setIsLogin(true);
            return;
          }
        }
        setSignupSuccess(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      showNotification("Authentication error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      showNotification('Check your email for password reset instructions!', 'success');
      setShowResetForm(false);
      setEmail('');
    } catch (error: any) {
      showNotification(error.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!jwtToken) {
        showNotification('Session expired. Please request a new password reset link.', 'error');
        navigate({ to: '/login', search: { mode: 'login' } });
        return;
      }

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
      setShowResetForm(false);
      setPassword('');
      navigate({ to: '/login', search: { mode: 'login' } });
    } catch (error: any) {
      console.error('Password update error:', error);
      showNotification(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Check Your Email!</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>We've just sent a verification link to <strong>{email}</strong>.</p>
                <p>If you don't see it in your inbox, don't forget to check your junk or spam folder.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate({ to: '/' })}>
                  Return Home
                </Button>
                <Button variant="outline" onClick={() => setSignupSuccess(false)}>
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResetForm === true || mode === 'update-password') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
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

  if (showResetForm === 'request') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowResetForm(false)}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </form>
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
            <CardTitle>{isLogin ? 'Welcome Back!' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Create a new account to get started'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mode Toggle */}
            <div className="flex mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
                  !isLogin 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
                  isLogin 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              {isLogin && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowResetForm('request')}
                  className="w-full text-sm"
                >
                  Forgot your password?
                </Button>
              )}
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}