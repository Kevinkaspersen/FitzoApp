import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/landing.css";
import QuoteComponent from "../components/quotes";

// Landing page component
const LandingPage = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Home";
  }, []);

  // Handle the Get Started button click
  const handleGetStartedClick = () => {
    if (isLoggedIn) {
      navigate("/application");
    } else {
      navigate("/login");
    }
  };

  // Return the JSX for the landing page
  return (
    <div className="landing">
      <div className="landing-content">
        <h1>Welcome to Fitzo.</h1>
        <div className="flex-box">
          <p>Fitzo: An everyday guide for being healthy.</p>
          <span className="logo-container">
            <img src="logo.png" alt="Logo" className="logo" />
          </span>
        </div>
        <div className="quote">
          <QuoteComponent />
        </div>
        <button onClick={handleGetStartedClick} className="get-started-btn">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
