// src/main.jsx
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Public Pages
import Login from "./components/Login/login.jsx";
import Register from "./components/Register/register.jsx";

// User Pages
import Dashboard from "./components/Dashboard/dashboard.jsx";
import CreateRequest from "./components/CreateRequest/createRequest.jsx";
import MyRequest from "./components/MyRequest/myRequest.jsx";
import Reports from "./components/Reports/reports.jsx";

// Admin / Role Pages
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import DeptHeadPage from "./components/Admin/DeptHeadPage.jsx";
import PPGSHeadPage from "./components/Admin/PPGSHeadPage.jsx";
import President from "./components/Admin/President.jsx";

// --------------------
// ProtectedRoute: ensures user is logged in
// --------------------
const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");
  return token ? <Component /> : <Navigate to="/login" replace />;
};

// --------------------
// RoleRoute: ensures user has correct role
// Admin can access everything
// --------------------
const RoleRoute = ({ element: Component, allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user?.role) return <Navigate to="/login" replace />;

  // Admin can access all pages
  if (user.role === "Admin") return <Component />;

  // If user's role is allowed
  if (allowedRoles.includes(user.role)) return <Component />;

  // Otherwise redirect to user dashboard
  return <Navigate to="/dashboard" replace />;
};

// --------------------
// App Render
// --------------------
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected Pages */}
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
        <Route path="/createRequest" element={<ProtectedRoute element={CreateRequest} />} />
        <Route path="/myRequest" element={<ProtectedRoute element={MyRequest} />} />
        <Route path="/reports" element={<ProtectedRoute element={Reports} />} />

        {/* Admin / Role Protected Pages */}
        <Route
          path="/AdminDashboard"
          element={<RoleRoute element={AdminDashboard} allowedRoles={["Admin"]} />}
        />
        <Route
          path="/DeptHeadPage"
          element={<RoleRoute element={DeptHeadPage} allowedRoles={["DeptHead"]} />}
        />
        <Route
          path="/PPGSHeadPage"
          element={<RoleRoute element={PPGSHeadPage} allowedRoles={["PPGSHead"]} />}
        />
        <Route
          path="/President"
          element={<RoleRoute element={President} allowedRoles={["President"]} />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </StrictMode>
);
