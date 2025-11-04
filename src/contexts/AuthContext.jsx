// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Merged Firebase + Firestore data
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Prevent repeated redirects
  const navigate = useNavigate();

  // --- Handle auth state changes ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData;
          if (userDoc.exists()) {
            userData = userDoc.data();
          } else {
            // Default new users to "student"
            userData = { uid: currentUser.uid, email: currentUser.email, role: "student" };
            await setDoc(userDocRef, userData);
          }

          // Merge Firebase and Firestore info
          const mergedUser = { ...currentUser, ...userData };
          setUser(mergedUser);
          setRole(userData.role);

          // Only navigate on initial load
          if (initialLoad) {
            navigate(`/dashboard/${userData.role.toLowerCase()}`);
            setInitialLoad(false);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth state error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, initialLoad]);

  // --- Auth actions ---
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
        userData = { uid: currentUser.uid, email: currentUser.email, role: "student" };
        await setDoc(userDocRef, userData);
      }

      setUser({ ...currentUser, ...userData });
      setRole(userData.role);
      navigate(`/dashboard/${userData.role.toLowerCase()}`);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const signupWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const userData = { uid: newUser.uid, email: newUser.email, name, role: "student" };
      await setDoc(doc(db, "users", newUser.uid), userData);

      // Immediately set user for dashboard display
      setUser({ ...newUser, ...userData });
      setRole("student");
      navigate(`/dashboard/student`); // Directly go to dashboard
      return newUser;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, loginWithGoogle, logout, signupWithEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
