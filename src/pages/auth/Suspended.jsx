// src/pages/auth/Suspended.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Suspended() {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReason = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, "institutes", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReason(docSnap.data().suspensionReason || "No reason provided.");
        }
      } catch (err) {
        console.error("Failed to fetch suspension reason:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReason();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth/login");
  };

  const handleRequestReactivation = async () => {
    if (!message.trim()) {
      alert("Please enter a message for your request.");
      return;
    }

    setRequesting(true);
    try {
      const docRef = doc(db, "institutes", auth.currentUser.uid);
      await updateDoc(docRef, {
        reactivationRequested: true,
        reactivationMessage: message.trim(),
        reactivationRequestedAt: serverTimestamp(),
      });
      alert("Reactivation request submitted!");
      setMessage("");
    } catch (err) {
      console.error("Failed to submit reactivation request:", err);
      alert("Could not submit request.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Account Suspended</h1>
      <p className="text-center">
        Your account has been suspended by the administrator.
      </p>
      <p className="text-center text-red-400">Reason: {reason}</p>

      <div className="w-full max-w-md space-y-4">
        <Textarea
          placeholder="Enter a message for reactivation request..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <Button onClick={handleRequestReactivation} disabled={requesting}>
          {requesting ? "Submitting..." : "Request Reactivation"}
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
