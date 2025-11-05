import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null); // "approved" | "pending" | "denied"
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  const redirectUser = (userData) => {
    if (!userData) return navigate("/auth/login");
    if (userData.status === "pending") navigate("/access/pending");
    else if (userData.status === "denied") navigate("/access/denied");
    else if (userData.role) navigate(`/dashboard/${userData.role.toLowerCase()}`);
    else navigate("/auth/login");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setRole(null);
          setStatus(null);
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        let userData;

        if (userDoc.exists()) {
          // User exists: could be student or approved request-access user
          userData = userDoc.data();
        } else {
          // New student signup
          userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            role: "student",
            status: "approved",
          };
          await setDoc(userDocRef, userData);
        }

        setUser({ ...currentUser, ...userData });
        setRole(userData.role);
        setStatus(userData.status || "pending");

        if (initialLoad) {
          redirectUser(userData);
          setInitialLoad(false);
        }
      } catch (err) {
        console.error("Auth state error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, initialLoad]);

  // --- Auth actions ---
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      // Check Firestore for approved/pending/denied accessRequests
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      let userData;

      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // No user doc yet, treat as normal student (or pending request)
        userData = { uid: currentUser.uid, email: currentUser.email, role: "student", status: "approved" };
        await setDoc(userDocRef, userData);
      }

      setUser({ ...currentUser, ...userData });
      setRole(userData.role);
      setStatus(userData.status || "pending");
      redirectUser(userData);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      let userData;
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        userData = { uid: currentUser.uid, email: currentUser.email, role: "student", status: "approved" };
        await setDoc(userDocRef, userData);
      }

      setUser({ ...currentUser, ...userData });
      setRole(userData.role);
      setStatus(userData.status || "pending");
      redirectUser(userData);
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    }
  };

  const signupWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const userData = { uid: newUser.uid, email: newUser.email, name, role: "student", status: "approved" };
      await setDoc(doc(db, "users", newUser.uid), userData);

      setUser({ ...newUser, ...userData });
      setRole("student");
      setStatus("approved");

      navigate("/dashboard/student");
      return newUser;
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setStatus(null);
      navigate("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, status, loading, loginWithEmail, loginWithGoogle, logout, signupWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
