/**
 * apps/admin/src/main.jsx
 *
 * Purpose: Application entry point for the Admin Panel.
 * Mounts the React app into the DOM root element.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
