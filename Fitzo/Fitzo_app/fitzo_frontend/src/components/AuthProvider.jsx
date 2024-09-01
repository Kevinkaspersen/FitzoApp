import { useState, useEffect } from "react";
import axios from "axios";

// Function to check the authentication status
const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check the authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/check_auth/",
          {
            withCredentials: true,
          }
        );
        setIsLoggedIn(response.data.isLoggedIn);
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error("Error checking authentication and login status:", error);
      }
    };
    checkAuth();
  }, []);
  return { isLoggedIn, isAdmin };
};

export default useAuthStatus;
