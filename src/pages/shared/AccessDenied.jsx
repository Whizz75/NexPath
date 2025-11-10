import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-800 border border-red-600/40 shadow-xl rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">
          Access Denied
        </h1>

        <p className="text-slate-300 mb-6">
          Unfortunately, your access request was <span className="text-red-400 font-semibold">rejected</span> by the system administrator.
          You no longer have permission to log in or access this platform.
        </p>

        <div className="space-y-3">
          <Button
            variant="default"
            className="w-full bg-primary hover:bg-primary/80"
            onClick={() => navigate("/auth/request-access")}
          >
            Request Access Again
          </Button>

          <Button
            variant="outline"
            className="w-full text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
