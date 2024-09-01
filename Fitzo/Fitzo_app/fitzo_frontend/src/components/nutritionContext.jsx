import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

// Calories context
const CaloriesContext = createContext();
export const useCalories = () => useContext(CaloriesContext);
export const CaloriesProvider = ({ children, currentDate }) => {
  const [Calories, setCalories] = useState(0);
  const [totalCalories, setTotalCalories] = useState(2000);

  // Function to fetch eaten calories from the backend
  const fetchCalories = useCallback(async () => {
    console.log("Currentdate in progcirc");
    console.log(currentDate);
    const formattedDate = currentDate.toISOString().slice(0, 10);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get_calories/?date=${formattedDate}`,
        { withCredentials: true }
      );
      // If the response contains the total calories, set the calories state
      if (response.data && response.data.total_calories !== undefined) {
        console.log("Fetched eaten calories:");
        console.log(response.data.total_calories);

        setCalories(response.data.total_calories);
      } else {
        setCalories(0);
      }
    } catch (error) {
      console.error("Failed to fetch calories:", error);
    }
  }, [currentDate]);

  // Function to fetch total calories from the backend
  const fetchTotalCalories = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/get_total_calories/",
        { withCredentials: true }
      );
      // If the response contains the total calories, set the totalCalories state
      if (response.data && response.data.length > 0) {
        setTotalCalories(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch total calories:", error);
    }
  }, []);

  // Return the Calories context provider
  return (
    <CaloriesContext.Provider
      value={{ Calories, totalCalories, fetchCalories, fetchTotalCalories }}
    >
      {children}
    </CaloriesContext.Provider>
  );
};
