import { Outlet, Navigate, useLocation } from 'react-router-dom';

export const PrivateRoutes = () => {
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('token')
    
    return (
        isAuthenticated ? <Outlet /> : <Navigate to={{
            pathname: '/login',
            state: { from: location } // Pass the current location state to the login page
        }} />
    );
};

    


/*
import { Outlet, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export const PrivateRoutes = ({ component: Component, ...rest }) => {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Outlet
            {...rest}
            render={props =>
                isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Navigate
                        to={{
                            pathname: '/login',
                            state: { from: props.location }
                        }}
                    />
                )
            }
        />
    );
};


PrivateRoutes.propTypes = {
    component: PropTypes.elementType,
    isAuthenticated: PropTypes.bool.isRequired,
    location: PropTypes.object, // If you want to include location in the props validation
};



*/