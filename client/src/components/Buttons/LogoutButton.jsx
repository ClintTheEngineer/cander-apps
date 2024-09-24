import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/landing-page');
  };

  return (
    <button id='logout-btn' onClick={handleLogout}>Log Out</button>
  );
}