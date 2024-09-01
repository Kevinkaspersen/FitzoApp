import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // React.strictMode is a wrapper component that checks for potential problems in development mode
  // It helps to identify unsafe lifecycles, legacy API usage, and a few other potential issues
  // it re-renders twice, re-runs effects twice. That is why we see multiple requests being sent
  // It is not intended for use in production, only in development
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
