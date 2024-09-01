import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/profile.css";

// Profile page component
function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
  });
  const [changedFields, setChangedFields] = useState({}); // Declare changedFields state
  const navigate = useNavigate();

  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Profile";
  }, []);

  // Fetch user info from the backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/user_info/",
          {
            withCredentials: true,
          }
        );
        const data = response.data;
        setUserInfo({
          username: data.username || "",
          password: "", // Passwords should not be fetched, reset this field
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          height: data.height || "",
          weight: data.weight || "",
          age: data.age || "",
          gender: data.gender || "",
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        navigate("/login");
      }
    };
    fetchUserInfo();
  }, [navigate]);
  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value,
    }));
    setChangedFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const csrftoken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      await axios.patch(
        "http://localhost:8000/api/update_user/",
        changedFields,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
          },
        }
      );
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/api/logout/", {
        withCredentials: true,
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  };
  // Return the profile JSX content
  return (
    <div className="profile-container">
      <h1>Welcome to your profile, {userInfo.username}</h1>
      <form className="profile-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={userInfo.password}
            onChange={handleChange}
            placeholder="Change password"
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={userInfo.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={userInfo.last_name}
            onChange={handleChange}
            placeholder="Enter last name"
          />
        </div>
        <div>
          <label>Height:</label>
          <input
            type="text"
            name="height"
            value={userInfo.height}
            onChange={handleChange}
            placeholder="Enter height (cm)"
          />
        </div>
        {/* Right column */}
        <div>
          <label>Weight:</label>
          <input
            type="text"
            name="weight"
            value={userInfo.weight}
            onChange={handleChange}
            placeholder="Enter weight (kg)"
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="text"
            name="age"
            value={userInfo.age}
            onChange={handleChange}
            placeholder="Enter age"
          />
        </div>
        <div>
          <label>Gender:</label>
          <select name="gender" value={userInfo.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <button type="submit">Update Profile</button>
      </form>
      <div className="profile-buttons">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default ProfilePage;
