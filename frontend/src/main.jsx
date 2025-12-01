import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
=======
import AuthApp from './authApp.jsx'
>>>>>>> b995432 (beginning to create a working login)
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<<<<<<< HEAD
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
=======
    <AuthApp />
>>>>>>> b995432 (beginning to create a working login)
  </React.StrictMode>,
)
