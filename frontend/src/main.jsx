/**
 * main.jsx — React Entry Point
 *
 * CONCEPT: This is where React "mounts" onto the HTML page.
 * index.html has <div id="root"></div>.
 * React takes that empty div and renders your entire app inside it.
 *
 * BrowserRouter wraps everything so React Router can read
 * the URL and show the right page component.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
