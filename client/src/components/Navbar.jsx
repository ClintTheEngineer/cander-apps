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
        <Link to='/'><li>Home</li></Link>
        {!isLoggedIn && <Link to='/register'><li>Register</li></Link>}
        {!isLoggedIn && <Link to='/login'><li>Sign In</li></Link>}        
        {isLoggedIn && <li onClick={handleLogout}>Sign Out</li>}
        </ul>
    </nav>
    </>
  )
}
