import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: type,
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
      <div className="flex items-center justify-center gap-3 mb-6">
        <img
          src="/logo.png"
          alt="NexPath Logo"
          className="w-12 h-12"
        />
        <h1 className="text-3xl font-bold text-slate-100">NexPath</h1>
      </div>


      <Card className="w-full max-w-md shadow-xl bg-slate-900 text-slate-100 border border-slate-800">
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

            {message && (
              <p className="text-center text-sm text-muted-foreground">{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-2">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-teal-400 hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
