import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail.jsx'; // <-- NEW IMPORT
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import InterviewSetup from './pages/InterviewSetup';
import Pricing from './pages/Pricing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* --- NEW ROUTE TO CATCH THE MAGIC LINK --- */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis/:id" element={<Analysis />} />
        <Route path="/interview-setup" element={<InterviewSetup />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;