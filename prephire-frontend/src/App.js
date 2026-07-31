import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import the provider

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import InterviewSetup from './pages/InterviewSetup';
import Pricing from './pages/Pricing';
import InterviewRoom from "./pages/InterviewRoom";
import InterviewDashboard from "./pages/InterviewDashboard";
import InterviewReport from "./pages/InterviewReport";

// Import your ProtectedRoute wrapper
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Pull the Client ID from your environment variables
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    // Wrap the Router with the GoogleOAuthProvider
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected Routes (Requires Authentication Token) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis/:id" element={<Analysis />} />
            <Route path="/interview-setup" element={<InterviewSetup />} />
            <Route path="/interview-room" element={<InterviewRoom />} />
            <Route path="/interviews" element={<InterviewDashboard />} />
            <Route path="/interview-report/:id" element={<InterviewReport />} />
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;