import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/kcalprog.css";
import { useCalories } from "./nutritionContext";

// ProgressCircle component
const ProgressCircle = (currentDate) => {
  const { Calories, totalCalories, fetchCalories, fetchTotalCalories } =
    useCalories();
  const [error, setError] = useState("");

  // Fetch the total and eaten calories from the backend
  useEffect(() => {
    console.log("Consuming context in ProgressCircle", {
      Calories,
      totalCalories,
    });
    fetchTotalCalories();
    fetchCalories();
  }, [fetchCalories, fetchTotalCalories, currentDate]);

  const progress = (Calories / totalCalories) * 100;
  const roundedProgress = Math.round(progress);
  const circleRadius = 85;
  const strokeDasharray = 2 * Math.PI * circleRadius; // Total circumference of the circle
  const strokeDashoffset = strokeDasharray * (1 - roundedProgress / 100); // Adjust based on progress
  const strokeColor = progress > 100 ? "#FF0000" : "#00BFFF"; // Use red if progress > 100%, otherwise use blue

  // Return the progress circle component
  return (
    <div className="mx-auto progress-circle-container">
      <svg width="240" height="240">
        <defs>
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="4" stdDeviation="5" floodColor="#001f3f" />
          </filter>
        </defs>

        <circle
          cx="120"
          cy="120"
          r={circleRadius}
          fill="none"
          stroke="#001f3f"
          strokeWidth="40"
          filter="url(#drop-shadow)"
        />

        <circle
          className="progress-circle-path"
          cx="120"
          cy="120"
          r={circleRadius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="35"
          opacity="0.8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 120 120)"
        />
        {error ? (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#ff0000"
          >
            {error}
          </text>
        ) : (
          <text
            x="50%"
            y="45%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#000"
          >
            {`${Calories} / ${totalCalories}`}
          </text>
        )}
        <text
          x="50%"
          y="60%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#000"
        >
          KCAL
        </text>
      </svg>
    </div>
  );
};

export default ProgressCircle;
