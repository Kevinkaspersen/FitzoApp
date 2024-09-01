import React, { useState, useEffect } from "react";
import ProgressCircle from "../components/CalorieTracker";
import MealSquare from "../components/AddFood";
import WaterTracker from "../components/WaterTracker";
import "../css/application.css";
import { CaloriesProvider } from "../components/nutritionContext";
import { useNavigate } from "react-router-dom";

// Application page component
const ApplicationPage = ({ isLoggedIn }) => {
  const [progress, setProgress] = useState(0);
  const [consumedWater, setConsumedWater] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date()); // Initialize with the current date
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Tracker";
  }, []);

  // Function to handle adding a meal
  const handleAddMeal = (mealName) => {
    setProgress((prevProgress) => prevProgress + 100);
    console.log(`Adding ${mealName} meal`);
  };

  // Function to handle suggesting a meal
  const handleSuggestMeal = (mealName) => {
    console.log(`Suggesting a meal for ${mealName}`);
  };
  // Function to handle adding water
  const handleAddWater = (amount) => {
    setConsumedWater((prevWater) => prevWater + amount);
  };

  // Function to handle removing water
  const handleRemoveWater = (amount) => {
    setConsumedWater((prevWater) => Math.max(0, prevWater - amount));
  };
  // Function to chnage to the previous day
  const handlePrevDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };
  // Function to change to the next day
  const handleNextDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  return (
    <CaloriesProvider currentDate={currentDate}>
      <div
        id="container"
        className="flex flex-col items-center justify-center h-screen"
      >
        {/* ProgressCircle and Date Display Container */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg mb-4">
          <div className="flex justify-center items-center mb-4">
            <button className="mr-6 text-black" onClick={handlePrevDay}>
              &lt;
            </button>
            <h1 className="text-xl font-bold text-black">
              {currentDate.toDateString()}
            </h1>
            <button className="ml-6 text-black" onClick={handleNextDay}>
              &gt;
            </button>
          </div>
          <ProgressCircle
            consumedCalories={progress}
            currentDate={currentDate}
          />
        </div>

        {/* WaterTracker */}
        <WaterTracker
          currentDate={currentDate}
          onAddWater={handleAddWater}
          onRemoveWater={handleRemoveWater}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <MealSquare
            mealName="Breakfast"
            recommendedCalories={500}
            currentDate={currentDate}
            onAddMeal={() => handleAddMeal("Breakfast")}
            onSuggestMeal={handleSuggestMeal}
          />
          <MealSquare
            mealName="Lunch"
            recommendedCalories={800}
            currentDate={currentDate}
            onAddMeal={() => handleAddMeal("Lunch")}
            onSuggestMeal={handleSuggestMeal}
          />
          <MealSquare
            mealName="Dinner"
            recommendedCalories={600}
            currentDate={currentDate}
            onAddMeal={() => handleAddMeal("Dinner")}
            onSuggestMeal={handleSuggestMeal}
          />
          <MealSquare
            mealName="Snacks"
            recommendedCalories={200}
            currentDate={currentDate}
            onAddMeal={() => handleAddMeal("Snacks")}
            onSuggestMeal={handleSuggestMeal}
          />
        </div>
      </div>
    </CaloriesProvider>
  );
};

export default ApplicationPage;
