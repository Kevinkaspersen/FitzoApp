import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// MealProgress component
const MealProgress = () => {
  const [mainChartData, setMainChartData] = useState({ datasets: [] });
  const [combinedChartData, setCombinedChartData] = useState({ datasets: [] });

  // Function to get the CSRF token from the cookie
  const getCookie = (name) => {
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
  };

  // Function to prepare chart data
  const prepareChartData = (data) => {
    if (!data || !data.meals) {
      console.log("Invalid data:", data);
      return;
    }

    const caloriesByDate = {};
    const mealTypeData = {};

    // Loop through the meals and calculate the calories by date and meal type
    data.meals.forEach((meal) => {
      caloriesByDate[meal.date] =
        (caloriesByDate[meal.date] || 0) + meal.calories_eaten;
      if (!mealTypeData[meal.meal_type]) {
        mealTypeData[meal.meal_type] = {};
      }
      mealTypeData[meal.meal_type][meal.date] =
        (mealTypeData[meal.meal_type][meal.date] || 0) + meal.calories_eaten;
    });

    const labels = Object.keys(caloriesByDate).sort();
    const dataPoints = labels.map((label) => caloriesByDate[label] || 0);
    const goalData = new Array(labels.length).fill(data.goal);

    // Prepare the datasets for the combined chart
    const datasets = Object.keys(mealTypeData).map((mealType) => ({
      label: `${mealType} Calories`,
      data: labels.map((label) => mealTypeData[mealType][label] || 0),
      borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)})`,
      fill: false,
      tension: 0.1,
    }));

    // Set the main chart data
    setMainChartData({
      labels,
      datasets: [
        {
          label: "Calories Eaten",
          data: dataPoints,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Daily Goal",
          data: goalData,
          fill: false,
          borderColor: "rgb(255, 99, 132)",
          borderDash: [5, 5],
        },
      ],
    });
    // Set the combined chart data
    setCombinedChartData({
      labels,
      datasets,
    });
  };
  // Function to fetch all meals
  const fetchAllMeals = async () => {
    const csrfToken = getCookie("csrftoken");
    try {
      const response = await axios.get(
        `http://localhost:8000/get-all-meals/?_=${new Date().getTime()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      // If the response contains meals, prepare the chart data
      if (response.data && Array.isArray(response.data.meals)) {
        prepareChartData(response.data);
      } else {
        console.log("No meals found or data is in an unexpected format.");
        setMainChartData({ datasets: [] });
        setCombinedChartData({ datasets: [] });
      }
    } catch (error) {
      console.error("There was a problem with fetching meals:", error);
      setMainChartData({ datasets: [] });
      setCombinedChartData({ datasets: [] });
    }
  };
  // Fetch all meals on component mount
  useEffect(() => {
    fetchAllMeals();
  }, []);

  // Return the MealProgress component
  return (
    <div>
      <div style={{ backgroundColor: "white", padding: "20px" }}>
        <h3>All-Time Calorie Progress</h3>
        <button onClick={fetchAllMeals}>Refresh</button>
        <ErrorBoundary>
          <div style={{ width: "800px", height: "400px" }}>
            <Line
              data={mainChartData}
              options={{ maintainAspectRatio: false }}
              key={Date.now()}
            />
          </div>
          <div style={{ width: "800px", height: "400px", marginTop: "20px" }}>
            <h4>Combined Meal Type Calories</h4>
            <Line
              data={combinedChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default MealProgress;
