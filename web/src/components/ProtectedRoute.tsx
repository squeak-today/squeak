import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const { jwtToken, isLoading } = useAuth();

    React.useEffect(() => {
        if (!isLoading && !jwtToken) {
            navigate('/auth');
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