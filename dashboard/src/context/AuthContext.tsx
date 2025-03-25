import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext<{
    jwtToken: string | null;
    isLoading: boolean;
    logout: () => Promise<void>;
}>({ 
    jwtToken: null, 
    isLoading: true,
    logout: async () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setJwtToken(session?.access_token || null);
            setIsLoading(false);
        };
        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setJwtToken(session?.access_token || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setJwtToken(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ jwtToken, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
