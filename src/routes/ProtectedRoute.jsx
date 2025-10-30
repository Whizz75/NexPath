import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { listenToAuthChanges, logoutUser } from "@/lib/auth";
import api from "@/lib/api";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not authenticated
  const [serverVerified, setServerVerified] = useState(undefined);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsub = listenToAuthChanges(setUser);
    return () => unsub();
  }, []);

  // While Firebase is loading
  if (user === undefined) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  // If no Firebase user, redirect to login
  if (!user) return <Navigate to="/auth/login" />;

  // Verify server session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await api.get("/sessionInfo", { withCredentials: true });

        // attach role from server if exists
        setServerVerified({ ...user, role: data.claims?.role || user.role });
      } catch (err) {
        console.error("Server session verification failed:", err);
        await logoutUser();
        setServerVerified(false);
      }
    };

    checkSession();
  }, [user]);

  if (serverVerified === undefined) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!serverVerified) return <Navigate to="/sign-in" />;

  return children(serverVerified);
}
