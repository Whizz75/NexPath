// src/components/SignupForm.jsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";

export function SignupForm({ className, ...props }) {
  const { loginWithGoogle, signupWithEmail } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signupWithEmail(email, password, name);
      // redirect handled in AuthContext
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await loginWithGoogle(); 
      // redirect handled in AuthContext after onAuthStateChanged
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 items-center justify-center min-h-screen bg-background p-4",
        className
      )}
      {...props}
    >
      <Card className="w-[450px] max-w-md shadow-xl border border-border rounded-xl">
        <CardHeader>
          <CardTitle className="text-teal-400 text-[1.1em]">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleEmailSignup}>
            <FieldGroup className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Harry Ntsekhe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field className="flex flex-col gap-2 mt-2">
                <Button type="submit" className="w-full mb-2" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>

                <hr className="text-teal-250 p-2" />

                <Button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full bg-teal-500 hover:bg-teal-600"
                  disabled={loading}
                >
                  Sign up with Google
                </Button>
              </Field>

              <FieldDescription className="text-center text-slate-400 mt-2">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-teal-400 hover:underline">
                  Log in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
