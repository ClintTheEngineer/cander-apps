import { Link, useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token');

  const isOnHomePage = location.pathname === '/';
  const isOnRegisterPage = location.pathname === '/register';
  const isOnLoginPage = location.pathname === '/login';

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('target');
    navigate('/');
  };
  
  return (
    <>
    <nav id="login-nav">
        <ul className="login-list">

        {!isLoggedIn && !isOnHomePage && <Link to='/landing-page'><li className="nav-list">Home</li></Link>}
        {!isLoggedIn && !isOnRegisterPage && <Link to='/register'><li className="nav-list">Register</li></Link>}
        {!isLoggedIn && !isOnLoginPage && <Link to='/login'><li className="nav-list">Sign In</li></Link>}        

        {isLoggedIn && <Link to='/apps-dashboard'><li className="nav-list">Apps Dashboard</li></Link>}
        {isLoggedIn && <Link to='/password-manager'><li className="nav-list">Password Manager</li></Link>}
        {isLoggedIn && <li className="nav-list" onClick={handleLogout}>Sign Out</li>}
        </ul>
    </nav>
    </>
  )
}
