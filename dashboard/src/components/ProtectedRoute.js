import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/auth/signup');
            } else {
                setSession(session);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate('/auth/signup');
            } else {
                setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    if (loading) {
        return null;
    }

    if (!session) {
        return null;
    }

    return children;
}

export default ProtectedRoute; 