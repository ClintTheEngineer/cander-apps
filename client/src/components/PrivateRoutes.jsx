import { Outlet, Navigate, useLocation } from 'react-router-dom';

export const PrivateRoutes = () => {
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('token')
    
    return (
        isAuthenticated ? <Outlet /> : <Navigate to={{
            pathname: '/login',
            state: { from: location }
        }} />
    );
};