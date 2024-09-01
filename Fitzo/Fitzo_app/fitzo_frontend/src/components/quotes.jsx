import React, { useState, useEffect } from "react";
import random_quotes from "../../quotes.json";

// Quote component
function QuoteComponent() {
  const [randomQuote, setRandomQuote] = useState(null);

  // Fetch a random quote from the quotes.json file
  useEffect(() => {
    async function fetchRandomQuote() {
      try {
        const quotes = random_quotes.random_quotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const selectedQuote = quotes[randomIndex];
        setRandomQuote(selectedQuote);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    }
    fetchRandomQuote();
  }, []);

  // Return the quote component
  return (
    <div className="quote-container">
      {randomQuote && (
        <blockquote>
          <p className="quote-text">{randomQuote.quote}</p>
          <footer className="quote-author">- {randomQuote.author}</footer>
        </blockquote>
      )}
    </div>
  );
}

export default QuoteComponent;
