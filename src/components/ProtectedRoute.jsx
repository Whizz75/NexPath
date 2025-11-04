// src/components/ProtectedRoute.jsx
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-lg font-medium animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  // Role-based route protection
  const basePath = `/dashboard/${role?.toLowerCase?.()}`;
  const isWithinRole =
    location.pathname.startsWith(basePath) || location.pathname === "/dashboard";

  if (!isWithinRole) {
    // Redirect user to their correct dashboard section
    return <Navigate to={basePath} replace />;
  }

  // Authenticated and authorized → render page
  return <>{children}</>;
}
