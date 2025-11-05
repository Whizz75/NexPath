// src/pages/shared/PendingApproval.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-100 mb-4">
          Access Pending
        </h1>
        <p className="text-slate-300 mb-6">
          Your access request is still being reviewed by our admin team.
          You will be notified once it has been approved.
        </p>
        <Button variant="outline" onClick={() => navigate("/auth/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}
