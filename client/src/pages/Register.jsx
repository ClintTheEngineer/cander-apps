import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Constants } from '../utils/Constants';
import { Navbar } from '../components/Navbar';
import computer from '../assets/computer.gif';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true); 
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [passwordStatus, setPasswordStatus] = useState('');
    const [passwordMatchStatus, setPasswordMatchStatus] = useState('');
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
      document.body.style.backgroundImage = `url(${computer})`;
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundSize = "cover"; 
      return () => {
          document.body.style.backgroundImage = ""; 
      };
  }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail.toLowerCase());
        setIsEmailValid(validateEmail(newEmail) && newEmail.trim() !== '');
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        
        if (validatePassword(newPassword)) {
            setPasswordStatus('Valid password');
        } else {
            setPasswordStatus('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        }

        // Only check match if confirm password is focused
        if (isConfirmPasswordFocused) {
            setPasswordMatchStatus(newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);

        // Check if passwords match
        setPasswordMatchStatus(newConfirmPassword === password ? 'Passwords match' : 'Passwords do not match');
    };

    const handleConfirmPasswordFocus = () => {
        setIsConfirmPasswordFocused(true);
        // Check if passwords match when the confirm password field is focused
        setPasswordMatchStatus(confirmPassword === password ? 'Passwords match' : 'Passwords do not match');
    };

    const handleConfirmPasswordBlur = () => {
        setIsConfirmPasswordFocused(false);
    };

    const handleRegistration = async () => {
        if (!isEmailValid) {
            console.error('Invalid email format or blank email');
            return;
        }
        if (password !== confirmPassword) {
            console.error('Passwords do not match!');
            setRegistrationStatus('Passwords do not match!');
            return;
        }
        if (!validatePassword(password)) {
            console.error('Password does not meet requirements');
            setRegistrationStatus('Password does not meet requirements');
            return;
        }

        try {
            const response = await fetch(`${Constants.SERVER_URL}register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.status === 201) {
                setRegistrationStatus('Registration successful, navigating to Login page');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else if (response.status === 403 || response.status === 405 || response.status === 406) {
                setRegistrationStatus(data.error);
            } else {
                console.error('Registration failed:', data);
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="auth-container">
                <h2>Register</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    style={{ borderColor: isEmailValid ? 'initial' : 'red' }}
                />
                {!isEmailValid && <p>Invalid email format</p>}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <p style={{ color: validatePassword(password) ? 'green' : 'red' }}>
                    {passwordStatus}
                </p>
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onFocus={handleConfirmPasswordFocus}
                    onBlur={handleConfirmPasswordBlur}
                />
                <p style={{ color: passwordMatchStatus === 'Passwords match' ? 'green' : 'red' }}>
                    {isConfirmPasswordFocused ? passwordMatchStatus : ''}
                </p>
                <button onClick={handleRegistration} disabled={!isEmailValid || !validatePassword(password) || passwordMatchStatus !== 'Passwords match'}>
                    Register
                </button>
                <p>{registrationStatus}</p>
            </div>
        </>
    );
};
