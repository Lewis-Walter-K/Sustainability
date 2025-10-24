import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import Login  from "./components/Login-Signup-Components/Login.tsx";
import SignUp  from "./components/Login-Signup-Components/SignUp.tsx";
import AuthRoute from "./components/Login-Signup-Components/AuthRoute.tsx";

import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AuthRoute><App /></AuthRoute>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
