// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  // Handles redirection logic
  const redirectUser = (userData) => {
    if (!userData) return navigate("/auth/login");

    const userStatus = userData.status;
    const userRole = userData.role?.toLowerCase();

    if (userStatus === "pending") return navigate("/access/pending");
    if (userStatus === "denied") return navigate("/access/denied");
    if (userStatus === "suspended") return navigate("/access/suspended");

    if (userRole) return navigate(`/dashboard/${userRole}`);
    navigate("/auth/login");
  };

  // Watches auth state
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

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        let userData;

        if (userSnap.exists()) {
          userData = userSnap.data();

          // Check institution status if user belongs to one
          if (userData.institutionId) {
            const instRef = doc(db, "institutions", userData.institutionId);
            const instSnap = await getDoc(instRef);
            if (instSnap.exists() && instSnap.data().status === "suspended") {
              userData.status = "suspended";
            }
          }
        } else {
          // New user — default to student
          userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            role: "student",
            status: "approved",
          };
          await setDoc(userRef, userData);
        }

        setUser({ ...currentUser, ...userData });
        setRole(userData.role);
        setStatus(userData.status);

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

  // ----------- LOGIN / SIGNUP ACTIONS -----------

  const loginWithEmail = async (email, password) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCred.user;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      let userData = userSnap.exists()
        ? userSnap.data()
        : { uid: currentUser.uid, email, role: "student", status: "approved" };

      // Check if institution suspended
      if (userData.institutionId) {
        const instRef = doc(db, "institutions", userData.institutionId);
        const instSnap = await getDoc(instRef);
        if (instSnap.exists() && instSnap.data().status === "suspended") {
          userData.status = "suspended";
        }
      }

      setUser({ ...currentUser, ...userData });
      setRole(userData.role);
      setStatus(userData.status);
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

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      let userData = userSnap.exists()
        ? userSnap.data()
        : { uid: currentUser.uid, email: currentUser.email, role: "student", status: "approved" };

      // Institution check
      if (userData.institutionId) {
        const instRef = doc(db, "institutions", userData.institutionId);
        const instSnap = await getDoc(instRef);
        if (instSnap.exists() && instSnap.data().status === "suspended") {
          userData.status = "suspended";
        }
      }

      setUser({ ...currentUser, ...userData });
      setRole(userData.role);
      setStatus(userData.status);
      redirectUser(userData);
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    }
  };

  const signupWithEmail = async (email, password, name) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCred.user;

      const userData = { uid: newUser.uid, email, name, role: "student", status: "approved" };
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
    <AuthContext.Provider
      value={{
        user,
        role,
        status,
        loading,
        loginWithEmail,
        loginWithGoogle,
        signupWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
