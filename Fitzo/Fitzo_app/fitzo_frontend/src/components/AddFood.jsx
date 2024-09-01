import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCalories } from "./nutritionContext";

// MealSquare component
const MealSquare = ({
  mealName,
  recommendedCalories,
  onAddMeal,
  onSuggestMeal,
  currentDate,
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [fetchedMeals, setFetchedMeals] = useState([]);
  const [mealGrams, setMealGrams] = useState([]); // Array to hold grams for each meal
  const { fetchCalories, fetchTotalCalories } = useCalories();
  const [totalCaloriesEaten, setTotalCaloriesEaten] = useState(0);

  useEffect(() => {
    fetchMeals();
  }, [currentDate]);

  // Function to fetch meals for the current date
  const fetchMeals = async () => {
    const csrfToken = getCookie("csrftoken");
    const date = currentDate.toISOString().slice(0, 10);
    try {
      const response = await axios.get(
        `http://localhost:8000/get-meal/?meal_type=${mealName}&date=${date}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      // Check if the response is valid and has meals data
      if (response.data && Array.isArray(response.data.meals)) {
        setFetchedMeals(response.data.meals);
        setMealGrams(response.data.meals.map((meal) => meal.grams || 0));
        setTotalCaloriesEaten(response.data.total_calories || 0);
      } else {
        // Handle cases where no meals data is returned or it's not in expected format
        console.log("No meals found or data is in an unexpected format.");
        setFetchedMeals([]);
        setMealGrams([]);
        setTotalCaloriesEaten(0);
      }
    } catch (error) {
      console.error("There was a problem with fetching meals:", error);
      setFetchedMeals([]);
      setMealGrams([]);
      setTotalCaloriesEaten(0);
    }
  };
  // Function to show or hide the meals modal
  const handleShowMeals = async () => {
    setShowMealModal(true);
    if (fetchedMeals.length === 0) {
      await fetchMeals();
    }
  };

  // Function to handle the search query
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/edamam-recipe-search/?ingredients=${searchQuery}`
      );
      setSearchResults(response.data.hints || []);
    } catch (error) {
      console.error("There was a problem with your fetch operation:", error);
      setSearchResults([]);
    }
  };

  // Function to remove a meal
  const handleRemoveMeal = async (food) => {
    const csrfToken = getCookie("csrftoken");
    const date = currentDate.toISOString().slice(0, 10);

    try {
      const response = await axios.delete(
        `http://localhost:8000/delete-meal/?meal_type=${mealName}&food_name=${food}&date=${date}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("Delete Meal Response:", response);
      await fetchMeals();
      fetchCalories();
      fetchTotalCalories();
    } catch (error) {
      console.error("There was a problem with deleting the meal:", error);
    }
  };

  // Function to add a meal
  const handleAdd = async (
    mealName,
    food,
    calories_per_100,
    amount_in_grams
  ) => {
    const csrfToken = getCookie("csrftoken");
    const date = currentDate.toISOString().slice(0, 10);
    try {
      const response = await axios.post(
        "http://localhost:8000/add-meal/",
        {
          date: date,
          meal_type: mealName,
          total_calories: calories_per_100,
          grams: amount_in_grams,
          food: food,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("Add Meal Response:", response);
      await fetchMeals();
      fetchCalories();
      fetchTotalCalories();
      onAddMeal(mealName);
    } catch (error) {
      console.error("There was a problem with adding the meal:", error);
    }
  };

  // Function to update a meal
  const updateMeal = async (index, grams) => {
    const meal = fetchedMeals[index];
    const date = currentDate.toISOString().slice(0, 10);
    const csrfToken = getCookie("csrftoken");
    try {
      const response = await axios.patch(
        `http://localhost:8000/update-meal/?meal_type=${mealName}&food_name=${meal.food}&grams=${grams}&date=${date}`,
        {
          grams: grams,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("Update Meal Response:", response);
      await fetchMeals();
      fetchCalories();
      fetchTotalCalories();
    } catch (error) {
      console.error("There was a problem with updating the meal:", error);
    }
  };

  // Function handle grams for each meal
  const handleGramsChange = (index, value) => {
    const newMealGrams = [...mealGrams];
    newMealGrams[index] = value === "" ? "" : Number(value);
    setMealGrams(newMealGrams);
  };

  // Function to get the value of a cookie
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

  // Return the MealSquare component
  return (
    <div className="meal-square p-4 border border-gray-300 rounded-md bg-white">
      <p className="text-lg font-semibold">{mealName}</p>
      <p className="text-sm text-gray-600">
        Calories eaten: {totalCaloriesEaten} kcal
      </p>

      <div className="mt-4 flex justify-between">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={handleShowMeals}
        >
          {showMealModal ? "Hide Meals" : "See Meals"}
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={() => setShowSearchModal(true)}
        >
          Search Meal
        </button>
      </div>
      {showMealModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg">
            <h2>{mealName}</h2>
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              {fetchedMeals.map((meal, index) => (
                <div
                  key={index}
                  style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                >
                  <p>
                    <strong>{meal.food}</strong>
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p>Calories Eaten: {meal.calories_eaten}</p>
                    <p>Grams eaten: {meal.grams}</p>
                  </div>

                  <input
                    type="number"
                    placeholder="Update grams eaten"
                    value={mealGrams[index] || ""}
                    onChange={(e) => handleGramsChange(index, e.target.value)}
                    className="border border-gray-300 p-1 rounded"
                  />
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => updateMeal(index, mealGrams[index])}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleRemoveMeal(meal.food)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => setShowMealModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showSearchModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="border border-gray-300 p-2 rounded"
              />
              <button
                type="submit"
                className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
              >
                Submit Search
              </button>
            </form>
            <div
              className="mt-4"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="mb-2"
                  style={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: "8px",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <p>
                      <strong>Food:</strong> {result.food.label}
                    </p>
                    <p>
                      <strong>Calories (per 100g):</strong>{" "}
                      {result.food.nutrients.ENERC_KCAL
                        ? result.food.nutrients.ENERC_KCAL.toFixed(2)
                        : "N/A"}{" "}
                      kcal
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="number"
                      placeholder="Amount in grams"
                      className="border border-gray-300 p-1 rounded"
                      style={{ marginRight: "10px" }}
                      onChange={(e) => (result.amount = e.target.value)} // Temporarily store the amount in the result object
                    />
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() =>
                        handleAdd(
                          mealName,
                          result.food.label,
                          result.food.nutrients.ENERC_KCAL,
                          result.amount || 0
                        )
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p>
              <strong>Added Food:</strong>
            </p>
            <div
              className="mt-4"
              style={{ maxHeight: "100px", overflowY: "auto" }}
            >
              {fetchedMeals.map((meal, index) => (
                <div
                  key={index}
                  style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
                >
                  <p>
                    <strong>{meal.food}</strong>
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p>Calories Eaten: {meal.calories_eaten}</p>
                    <p>Grams eaten: {meal.grams}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => setShowSearchModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealSquare;
