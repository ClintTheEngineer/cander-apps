import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };
  return (
    <>
    <nav id="login-nav">
        <ul className="login-list">
        <Link to='/'><li className="nav-list">Home</li></Link>
        {!isLoggedIn && <Link to='/register'><li className="nav-list">Register</li></Link>}
        {!isLoggedIn && <Link to='/login'><li className="nav-list">Sign In</li></Link>}        
        
        {isLoggedIn && <Link to='/password-manager'><li className="nav-list">Password Manager</li></Link>}
        {isLoggedIn && <li className="nav-list" onClick={handleLogout}>Sign Out</li>}
        </ul>
    </nav>
    </>
  )
}
