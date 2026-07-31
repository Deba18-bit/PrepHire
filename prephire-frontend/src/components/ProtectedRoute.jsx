import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // Check if your auth token or user exists in localStorage (adjust based on your auth state logic)
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");

  // If no token exists, redirect them to the sign-in/login page
  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  // Otherwise, allow them to access the nested protected routes
  return <Outlet />;
}