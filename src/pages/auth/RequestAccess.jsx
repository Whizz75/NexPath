import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestAccess() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !type) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // --- Create Firebase Auth user ---
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // --- Create Firestore doc with pending status ---
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: type, // requested role
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage("Your request has been submitted. Please wait for admin approval.");
      setName("");
      setEmail("");
      setPassword("");
      setType("");

      navigate("/access/pending");
    } catch (err) {
      console.error("Error submitting request:", err);
      setMessage(err.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-md shadow-lg bg-slate-900 text-slate-100">
        <CardHeader>
          <CardTitle className="text-center text-xl">Request Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 text-slate-100"
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 text-slate-100"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 text-slate-100"
            />
            <Select onValueChange={setType} value={type}>
              <SelectTrigger className="bg-slate-800 text-slate-100">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-slate-100">
                <SelectItem value="institute">Institution</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
