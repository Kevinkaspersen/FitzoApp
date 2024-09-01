import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/admin.css";
import "../css/overlay_admin.css";

// Admin page component
function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserData, setNewUserData] = useState({}); // State to hold new user data input
  const navigate = useNavigate();

  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Admin";
  }, []);

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users/", {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Handle error, e.g., redirect to login page
        navigate("/login");
      }
    };

    fetchUsers();
  }, []);

  // Go to django admin login page
  const handleAdminLogin = () => {
    window.location.href = "http://localhost:8000/admin/login/?next=/admin/";
  };

  // Handle edit user for admin page
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUserData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    }); // Set new user data with initial values
  };

  // Function to get the CSRF token from the cookie
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === `${name}=`) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  // Handle update user for admin page
  const handleUpdateUser = async () => {
    const csrftoken = getCookie("csrftoken");
    try {
      await axios.patch(
        `http://localhost:8000/api/admin_edit_user/${selectedUser.username}/`,
        newUserData,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
          },
        }
      );
      alert("Profile updated successfully!");
      const response = await axios.get("http://localhost:8000/api/users/", {
        withCredentials: true,
      });
      setUsers(response.data);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };
  // Handle delete user for admin page
  const handleDeleteUser = async (username) => {
    const csrftoken = getCookie("csrftoken");
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(
          `http://localhost:8000/api/admin_delete_user/${username}/`,
          {
            withCredentials: true,
            headers: {
              "X-CSRFToken": csrftoken,
            },
          }
        );
        alert("User deleted successfully.");
        const response = await axios.get("http://localhost:8000/api/users/", {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };
  // Return the JSX for the AdminPage component
  return (
    <div className="admin-page-container">
      <div className="admin-login-box">
        <h2>Django Admin Login</h2>
        <p>Click the button below to access the Django admin login page.</p>
        <button onClick={handleAdminLogin}>Go to Django Admin Login</button>
      </div>
      <div className="admin-page">
        <div className="current-users-container">
          <h1>Current Registered users</h1>
        </div>
      </div>
      <div className="user-list-container">
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <div className="user-info">
                <div className="user-container">
                  <p>
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>First Name:</strong> {user.first_name}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {user.last_name}
                  </p>
                </div>
                <div className="button-container">
                  <button onClick={() => handleEditUser(user)}>Edit</button>
                  <button onClick={() => handleDeleteUser(user.username)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {selectedUser && (
        <div className="overlay">
          <div className="overlay-content">
            <h2 className="edit-user-heading">Edit User</h2>
            <div>
              <label htmlFor="newUsername">New Username:</label>
              <input
                type="text"
                id="newUsername"
                value={newUserData.username}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="newEmail">New Email:</label>
              <input
                type="email"
                id="newEmail"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="newFirstName">New First Name:</label>
              <input
                type="text"
                id="newFirstName"
                value={newUserData.first_name}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="newLastName">New Last Name:</label>
              <input
                type="text"
                id="newLastName"
                value={newUserData.last_name}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, last_name: e.target.value })
                }
              />
            </div>
            <button className="update-btn" onClick={handleUpdateUser}>
              Update
            </button>
            <button
              className="cancel-btn"
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
