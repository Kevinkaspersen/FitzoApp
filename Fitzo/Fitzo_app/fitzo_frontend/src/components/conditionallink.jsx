import React from "react";
import { useNavigate } from "react-router-dom";

// ConditionalLink component
const ConditionalLink = ({ to, children, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault(); // Prevent the link from navigating directly
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login if not logged in
    } else {
      navigate(to); // Navigate to the intended route if logged in
    }
  };

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
};

export default ConditionalLink;
