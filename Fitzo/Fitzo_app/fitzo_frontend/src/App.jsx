import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ApplicationPage from "./pages/ApplicationPage";
import ProgressPage from "./pages/ProgressPage";
import UserPage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import useAuthStatus from "./components/AuthProvider";

/* Main application component */
function App() {
  const { isLoggedIn, isAdmin } = useAuthStatus();
  return (
    <Router>
      <NavBar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} />} />
          <Route
            path="/login"
            element={<LoginPage isLoggedIn={isLoggedIn} />}
          />
          <Route path="/login/register" element={<RegisterPage />} />
          <Route
            path="/application"
            element={<ApplicationPage isLoggedIn={isLoggedIn} />}
          />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<UserPage />} />
          <Route path="/adminpage" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
