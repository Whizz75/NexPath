import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-300">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="flex items-center justify-center gap-3 mb-8">
        <img
          src="/logo.png"
          alt="NexPath Logo"
          className="w-12 h-12"
        />
        <h1 className="text-3xl font-bold text-slate-100">NexPath</h1>
      </div>

      <Card className="w-full max-w-lg bg-slate-900 border border-slate-800 shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-red-400">
            Account Suspended
          </CardTitle>
          <p className="text-slate-400">
            Your account has been temporarily disabled by the administrator.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-red-400">Reason:</span>{" "}
              {reason}
            </p>
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="Write a message to request reactivation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-slate-800 text-slate-100 border-slate-700"
            />
            <Button
              onClick={handleRequestReactivation}
              disabled={requesting}
              className="w-full bg-teal-500 hover:bg-teal-500 text-white font-semibold"
            >
              {requesting ? "Submitting..." : "Request Reactivation"}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500 mt-6">
        Need help? Contact{" "}
        <a
          href="mailto:support@nexpath.com"
          className="text-teal-400 hover:underline"
        >
          support@nexpath.com
        </a>
      </p>
    </div>
  );
}
