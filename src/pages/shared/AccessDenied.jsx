// src/pages/shared/AccessDenied.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-8 text-center">
        <h1 className="text-2xl font-semibold text-red-400 mb-4">
          Access Denied
        </h1>
        <p className="text-slate-300 mb-6">
          Your request for access has been denied. Please contact support or
          try again with the correct credentials.
        </p>
        <Button variant="outline" onClick={() => navigate("/auth/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}
