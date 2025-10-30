// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRouter from "./RoleRouter";

// Dashboards
import StudentDashboard from "@/pages/student/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import InstituteDashboard from "@/pages/institute/Dashboard";
import CompanyDashboard from "@/pages/company/Dashboard";
import Verify from "@/pages/auth/Verify";
import NotFound from "@/pages/common/NotFound";
import SignIn from "@/pages/auth/SignIn";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/verify" element={<Verify />} />

      {/* Root route: redirects based on role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {(user) => <RoleRouter role={user.role} />}
          </ProtectedRoute>
        }
      />

      {/* Student dashboard */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            {(user) =>
              user.role === "student" ? (
                <StudentDashboard />
              ) : (
                <RoleRouter role={user.role} />
              )
            }
          </ProtectedRoute>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            {(user) =>
              user.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <RoleRouter role={user.role} />
              )
            }
          </ProtectedRoute>
        }
      />

      {/* Institute dashboard */}
      <Route
        path="/institute/dashboard"
        element={
          <ProtectedRoute>
            {(user) =>
              user.role === "institution" ? (
                <InstituteDashboard />
              ) : (
                <RoleRouter role={user.role} />
              )
            }
          </ProtectedRoute>
        }
      />

      {/* Company dashboard */}
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute>
            {(user) =>
              user.role === "company" ? (
                <CompanyDashboard />
              ) : (
                <RoleRouter role={user.role} />
              )
            }
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
