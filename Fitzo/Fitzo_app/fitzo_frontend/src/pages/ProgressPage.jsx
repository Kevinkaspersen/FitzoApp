import React, { useEffect } from "react";
import MealProgress from "../components/mealprogress";

// Progress page component
const ProgressPage = () => {
  // Use useEffect to set document title when the component mounts
  useEffect(() => {
    document.title = "Fitzo | Progress";
  }, []);

  return (
    <div className="pt-24">
      {" "}
      {/* Tailwind class for padding-top: 100px */}
      <h1>Progress</h1>
      <MealProgress />
    </div>
  );
};

export default ProgressPage;
