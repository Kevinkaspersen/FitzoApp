import React, { useState } from "react";
import "../css/navbar.css";
import { Link, NavLink } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ConditionalLink from "./conditionallink"; // Make sure to import ConditionalLink with correct casing

// Navbar component
const Navbar = ({ isLoggedIn, isAdmin }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Return JSX for the Navbar component
  return (
    <nav>
      <Link to="/" className="title">
        <img src="logo.png" alt="Logo" className="logo small-logo" />
        <p>Fitzo.</p>
      </Link>

      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <ConditionalLink to="/application" isLoggedIn={isLoggedIn}>
            Tracker
          </ConditionalLink>
        </li>
        <li>
          <ConditionalLink to="/progress" isLoggedIn={isLoggedIn}>
            Progress
          </ConditionalLink>
        </li>
        {isLoggedIn ? (
          <>
            {isAdmin === true && (
              <li>
                <NavLink to="/adminPage">Admin Page</NavLink>
              </li>
            )}
            <li className="profile-icon">
              <NavLink to="/profile">
                <AccountCircleIcon />
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
