import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogoutButton } from '../components/LogoutButton';
import { Constants } from './Constants';


export const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');        
        if (!storedToken) {
            navigate('/login');
        } else {
            const storedEmail = localStorage.getItem('email');
            const storedUsername = localStorage.getItem('username');
            
            if (!storedEmail || !storedUsername) {
                navigate('/login');
            }
        }
    }, [navigate]);

     

    return (
        <>
            <h1 className='app-name'>{Constants.APP_NAME}</h1>
            <div className="user-info">
                <p>Hello, {username ? username.toUpperCase() : 'User'}</p>
            </div>
            <LogoutButton /> <br />
        </>
    );
};




export default Home;