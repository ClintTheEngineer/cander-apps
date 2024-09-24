import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const Profile = () => {
  return (
    <>
    <Navbar />
    <section className="landings-section">
        <div className="landings-container">
          <Link to="/password-manager" className="landing-link">
          <div className="landing-box">
            <h3>Password Manager</h3>
          </div>
          </Link>
          <Link to="/apps-dashboard" className="landing-link">
          <div className="landing-box">
            <h3>Applications Dashboard</h3>
          </div>
        </Link>
        </div>
      </section>
      </>
  )
}
