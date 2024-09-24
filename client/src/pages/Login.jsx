import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Constants } from '../pages/Constants';
import { Navbar } from '../components/Navbar';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); 
    const navigate = useNavigate();
    //const location = useLocation();

    //const from = { from: location.pathname, target: '/password-manager' }.target;
    //location.state = { from: location.pathname, target: '/password-manager' }.target;
    //console.log(from)
   // console.log(location)
    //const { from, target } = location.state || {};
    //const target = location.state?.target;
    const target = localStorage.getItem('target')
    console.log('Target:', target)

  //console.log('Came from:', from);  // Logs the previous path
 // console.log('Target:', target);    // Logs '/password-manager

    // Check if the user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // If already logged in, navigate to the intended page or the default page
            navigate(target, { replace: true });
        }
    }, [navigate, target]);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${Constants.SERVER_URL}login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.status === 200) {
                const token = data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('email', email);
                navigate(target, { replace: true }); // Navigate to the intended page
            } else if (response.status === 400) {
                setErrorMessage('Login failed');
                console.error('Login failed:', response.status);
            } else if (response.status === 401) {
                setErrorMessage('Incorrect username/password.');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('An error occurred while logging in.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <>
            <Navbar />
            <div className="auth-container">
                <h1>{Constants.APP_NAME}</h1>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyPress}
                />
                <button onClick={handleLogin}>Login</button>
                <Link to="/forgot-password">Forgot Password?</Link>
                <p>{errorMessage}</p>
            </div>
        </>
    );
};
