import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/login.css";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

// Login component for user login
function Login({ isLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Login";
  }, []);

  if (isLoggedIn) {
    navigate("/application");
  }

  // Handle login
  const handleLogin = () => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const url = `http://localhost:8000/api/login/`;
    axios
      .post(url, { username, password }, { withCredentials: true })
      .then((response) => {
        console.log(response);
        window.location.href = "/profile"; // Redirect after successful login
      })
      .catch((error) => {
        let message = "Invalid username or password"; // Default message
        if (error.response && error.response.data) {
          if (error.response.status === 429) {
            message = "Too many login attempts. Please try again later.";
          } else if (typeof error.response.data === "string") {
            message = error.response.data;
          } else if (error.response.data.error) {
            message = error.response.data.error;
          } else {
            message = Object.values(error.response.data).flat().join(" ");
          }
        }
        console.error("Error logging in:", message);
        setError(message);
      });
  };
  // Handle Enter key press to login
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };
  // Return the JSX for the Login component
  return (
    <div className="login">
      <div className="login-container">
        <h1>Login</h1>
        <div className="input_container">
          <div className="input_item">
            <PersonIcon className="icon" />
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input_item">
            <LockIcon className="icon" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button onClick={handleLogin}>Login</button>
        </div>
        <p>
          Don't have an account? <Link to="/login/register">Sign up</Link>
        </p>
        {error && <p className="error">{error}</p>}{" "}
        {/* Display error message */}
      </div>
    </div>
  );
}

export default Login;
