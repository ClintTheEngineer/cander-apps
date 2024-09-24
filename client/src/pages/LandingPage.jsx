import { Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import "../../src/LandingPage.css";
import logo from "../assets/logo-img.webp";
import { Constants } from "../utils/Constants";

const LandingPage = () => {
  const location = useLocation();

  const handleLinkClick = (target) => {
    localStorage.setItem('target', target);
  }
  
  return (
    <>
      <Navbar />
      <header className="landing-header">
        <div className="landing-content">
          <h1>Welcome to Cander Apps</h1>
          <p>
            Secure your passwords and manage your bookmarks all in one place.
            Experience seamless organization with Cander Apps.
          </p>
          <div className="cta-buttons">
            <Link
              to="/password-manager"
              className="cta-btn"
              state={{ from: location.pathname, target: '/password-manager' }}
              onClick={() => handleLinkClick('/password-manager')}
            >
              Manage Passwords
            </Link>
            <Link
              to="/apps-dashboard"
              className="cta-btn cta-secondary"
              state={{ from: location.pathname, target: '/apps-dashboard' }}
              onClick={() => handleLinkClick('/apps-dashboard')}
            >
              View Bookmarks
            </Link>
          </div>
        </div>
        <div className="landing-illustration">
          <img
            src={logo}
            alt="Landing Illustration"
          />
        </div>
      </header>

      <section className="features-section">
        <div className="features-container">
          <div className="feature-box">
            <h3>Password Manager</h3>
            <p>
              Securely store and manage your passwords with ease. Generate
              strong passwords and store login information for all your
              accounts.
            </p>
            <Link to="/password-manager" className="feature-link">
              Learn More
            </Link>
          </div>
          <div className="feature-box">
            <h3>Bookmark Manager</h3>
            <p>
              Save, organize, and access your favorite websites with drag and
              drop functionality. Create a customized dashboard of clickable
              tiles.
            </p>
            <Link to="/apps-dashboard" className="feature-link">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {Constants.CURRENT_YEAR} Cander Apps. All rights reserved.</p>
      </footer>
    </>
  );
};

export default LandingPage;
