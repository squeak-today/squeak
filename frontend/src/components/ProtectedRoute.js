import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/');
            }
            setLoading(false);
        });
    }, [navigate]);

    if (loading) {
        return null;
    }

    return children;
}

export default ProtectedRoute; 