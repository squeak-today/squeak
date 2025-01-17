import { useState, useEffect } from 'react';

import { BrowserBox, Subtitle } from './StyledComponents';
import { createClient } from '@supabase/supabase-js';

import { AuthContainer, AuthForm, AuthInput, AuthButton, AuthToggle } from '../styles/AuthPageStyles';

const supabase = createClient(
	process.env.REACT_APP_SUPABASE_URL,
	process.env.REACT_APP_SUPABASE_ANON_KEY
);

function SupabaseAuth() {
	const [session, setSession] = useState(null);
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

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
			} else {
				const { error } = await supabase.auth.signUp({
					email,
					password,
				});
				if (error) throw error;
			}
		} catch (error) {
			console.error('Auth error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!session) {
		return (
			<BrowserBox>
				<AuthContainer>
					<Subtitle>
						{isLogin ? 'Welcome Back!' : 'Create Account'}
					</Subtitle>
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
							{loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
						</AuthButton>
					</AuthForm>
					<AuthToggle onClick={() => setIsLogin(!isLogin)}>
						{isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
					</AuthToggle>
				</AuthContainer>
			</BrowserBox>
		);
	} else {
		return (
			<BrowserBox>
				<AuthContainer>
					<Subtitle>Welcome!</Subtitle>
					<AuthButton 
						onClick={async () => {
							await supabase.auth.signOut();
						}}
					>
						Logout
					</AuthButton>
				</AuthContainer>
			</BrowserBox>
		);
	}
}

function AuthBlocks() {
	return <SupabaseAuth />;
}

export default AuthBlocks;