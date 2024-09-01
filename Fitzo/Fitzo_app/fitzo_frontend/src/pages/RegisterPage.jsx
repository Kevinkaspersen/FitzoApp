import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/register.css";
import PersonIcon from "@mui/icons-material/Person";
import MailIcon from "@mui/icons-material/Mail";
import LockIcon from "@mui/icons-material/Lock";

// Register component for user registration
function Register() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Register";
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle next step
  const handleNext = () => {
    const {
      username,
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
    } = userData;
    if (
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Clear any previous errors
    setError("");
    // Move to the next step
    setStep(2);
  };

  const handleBack = () => {
    // Move back to the first step
    setStep(1);
  };

  // Handle registration button click to submit the registration data
  const handleRegister = () => {
    const { height, weight, age, gender } = userData;
    if (!height || !weight || !age || !gender) {
      setError("Please fill in all fields.");
      return;
    }
    const { confirmPassword, ...finalData } = userData;
    axios
      .post("http://localhost:8000/api/register/", finalData)
      .then((response) => {
        navigate("/login"); // Redirect to login after successful registration
      })
      .catch((error) => {
        let message = "An unexpected error occurred.";
        if (error.response && error.response.data) {
          if (error.response.data.email) {
            message = error.response.data.email.join(" "); // Join all email error messages into a single string if there are multiple
          } else {
            message = Object.values(error.response.data).flat().join(" "); // Handle other errors or a generic error object/array
          }
        }
        console.error("Error creating user:", message);
        setError(message);
      });
  };
  // Return the JSX for the Register component
  return (
    <div className="register">
      <div className="register-container">
        <h1>Sign Up - Step {step}</h1>
        <div className="input_container">
          {/* Conditional rendering for steps */}
          {step === 1 ? (
            <>
              {/* Input fields for step 1 */}
              <div className="input_item">
                <PersonIcon className="icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={userData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <PersonIcon className="icon" />
                <input
                  type="text"
                  id="first_name"
                  placeholder="First Name"
                  value={userData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <PersonIcon className="icon" />
                <input
                  type="text"
                  id="last_name"
                  placeholder="Last Name"
                  value={userData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <MailIcon className="icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={userData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <LockIcon className="icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={userData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <LockIcon className="icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <button onClick={handleNext}>Next</button>
            </>
          ) : (
            <>
              {/* Input fields for step 2 */}
              <div className="input_item">
                <input
                  type="text"
                  id="height"
                  placeholder="Height (cm)"
                  value={userData.height}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <input
                  type="text"
                  id="weight"
                  placeholder="Weight (kg)"
                  value={userData.weight}
                  onChange={handleChange}
                />
              </div>
              <div className="input_item">
                <input
                  type="text"
                  id="age"
                  placeholder="Age"
                  value={userData.age}
                  onChange={handleChange}
                />
              </div>
              <select
                className="input_item"
                id="gender"
                value={userData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <button onClick={handleRegister}>Create Account</button>
              <button onClick={handleBack}>Back</button>
            </>
          )}
          {error && <p className="error">{error}</p>}{" "}
          {/* Display error message */}
        </div>
      </div>
    </div>
  );
}

export default Register;
