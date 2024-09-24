import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Constants } from '../utils/Constants';
import { Navbar } from '../components/Navbar';


export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true); 
    const [registrationStatus, setRegistrationStatus] = useState('');
    const navigate = useNavigate();
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/');
      }
    }, [navigate]);
  
    const validateEmail = (email) => {
      const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      return emailRegex.test(email);
    };
  
    const handleEmailChange = (e) => {
      const newEmail = e.target.value;
      setEmail(newEmail.toLowerCase());
      setIsEmailValid(validateEmail(newEmail) && newEmail.trim() !== ''); 
    };
  
    const handleRegistration = async () => {
      if (!isEmailValid) {
        console.error('Invalid email format or blank email');
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
          setRegistrationStatus('Registration successful, navigating to Login page')
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (response.status === 403 || response.status === 405) {
          setRegistrationStatus(data.error);
        } else if (response.status === 406) {
          setRegistrationStatus(data.error);
        } else {
          console.error('Registration failed:', JSON.parse(data));
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
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegistration} disabled={!isEmailValid}>
                Register
            </button>
            <p>{registrationStatus}</p>
        </div>
        </>
    );
 

}