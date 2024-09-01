import React, { useState, useEffect } from "react";
import axios from "axios";

// Function to get the CSRF token from the cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// WaterTracker component
const WaterTracker = ({ onAddWater, onRemoveWater, currentDate }) => {
  const targetWater = 3000;
  const [consumedWater, setConsumedWater] = useState(0);
  const progressPercent = (consumedWater / targetWater) * 100;
  const [amount, setAmount] = useState("");

  // Function to fetch water intake from the backend
  const fetchWaterIntake = async () => {
    const csrfToken = getCookie("csrftoken");
    const date = currentDate.toISOString().slice(0, 10);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get_water_intake/?date=${date}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      // If the response contains the total water intake, set the consumedWater state
      if (response.data && response.data.total_water_intake !== undefined) {
        setConsumedWater(response.data.total_water_intake);
        setAmount("");
      } else {
        setConsumedWater(0);
        setAmount("");
      }
    } catch (error) {
      console.error("There was a problem with fetching water intake:", error);
      setConsumedWater(0);
      setAmount("");
    }
  };

  // Function to handle adding or removing water
  const handleWaterAction = async (action) => {
    const csrfToken = getCookie("csrftoken");
    const date = currentDate.toISOString().slice(0, 10);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/update_water/",
        { total_water_intake: action === "add" ? amount : -amount, date: date },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      // If the response contains the total water intake, update the consumedWater state
      if (response.data && response.data.total_water_intake !== undefined) {
        const updatedWaterIntake = response.data.total_water_intake;
        setConsumedWater(updatedWaterIntake);
        if (action === "add") {
          onAddWater(updatedWaterIntake);
        } else if (action === "remove") {
          onRemoveWater(updatedWaterIntake);
        }
      }
    } catch (error) {
      console.error(
        `Error ${action === "add" ? "adding" : "removing"} water:`,
        error
      );
    }
  };
  // Use the useEffect hook to fetch the water intake when the component mounts
  useEffect(() => {
    fetchWaterIntake();
  }, [currentDate]);

  // Return the JSX for the WaterTracker component
  return (
    <div
      className="water-tracker mt-8 w-full max-w-md mx-auto p-2 border border-gray-300 rounded-md bg-gray-100"
      style={{ width: "calc(100% + 2rem)" }}
    >
      <h2 className="text-lg font-semibold">Water Tracker</h2>
      <div className="flex items-center mt-2">
        <input
          type="number"
          className="border border-gray-300 rounded-md px-2 py-1 w-full mr-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (ml)"
        />
        <button
          className="btn bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => handleWaterAction("add")}
        >
          Add
        </button>
        <button
          className="btn bg-blue-500 text-white px-3 py-1 rounded ml-2"
          onClick={() => handleWaterAction("remove")}
        >
          Remove
        </button>
      </div>
      <div className="progress-bar mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="progress-bar-inner bg-blue-500 h-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1">{consumedWater / 1000}L consumed</p>
      <p className="text-xs mt-1">Use ml for amounts</p>
    </div>
  );
};

export default WaterTracker;
