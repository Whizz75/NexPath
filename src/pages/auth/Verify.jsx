import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    if (!oobCode) {
      setStatus("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus("✅ Email verified! Please sign in to continue.");

        setTimeout(() => {
          navigate("/sign-in"); // redirect to sign-in page
        }, 1500);
      } catch (err) {
        console.error("Verification failed:", err);
        setStatus("Verification failed. The link may be invalid or expired.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="container py-20 flex justify-center">
      <div className="w-[420px] text-center space-y-4">
        <h2 className="text-2xl font-semibold">Email Verification</h2>
        <p>{status}</p>
      </div>
    </div>
  );
}
