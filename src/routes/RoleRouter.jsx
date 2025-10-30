import { Navigate } from "react-router-dom";

export default function RoleRouter({ role }) {
  switch (role) {
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    case "institution":
      return <Navigate to="/institute/dashboard" replace />;
    case "company":
      return <Navigate to="/company/dashboard" replace />;
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/sign-in" replace />;
  }
}
