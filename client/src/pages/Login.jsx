import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Constants } from '../utils/Constants';
import { Navbar } from '../components/Navbar';
import computer from '../assets/computer.gif';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); 
    const navigate = useNavigate();
    
    const target = localStorage.getItem('target') || '/profile';  

    useEffect(() => {
        if (!target) {
            navigate('/login', { replace: true });
            localStorage.removeItem('target')
        } 
    }, [navigate, target]);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${computer})`;
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "cover"; 
        return () => {
            document.body.style.backgroundImage = ""; 
        };
    }, []);


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
                navigate(target, { replace: true });
                localStorage.removeItem('target');
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
