// src/lib/auth.js
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, sendSignInLinkToEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import api from "@/lib/api"; // Axios instance for backend calls

/**
 * Listen to real-time authentication state changes.
 * Automatically fetches the user's role from Firestore.
 */
export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        callback({ ...user, role });
      } else {
        console.warn("User record missing in Firestore for:", user.uid);
        callback({ ...user, role: "student" }); // fallback
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      callback({ ...user, role: "student" }); // fallback
    }
  });
}

/**
 * Signs out the currently logged-in user.
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

/**
 * Fetches the current server session info (if any).
 * Useful for secure backend-side session validation.
 */
export async function getServerSession() {
  try {
    const res = await api.get("/sessionInfo", { withCredentials: true });
    return res.data; // Expected shape: { uid, email, emailVerified, claims }
  } catch (err) {
    console.error("Error fetching session info:", err);
    return null;
  }
}

/**
 * Sends a Firebase email verification link to the given user email.
 * The link will redirect to the dashboard's /verify page.
 */
export async function sendEmailVerification(userEmail) {
  const actionCodeSettings = {
    url: import.meta.env.VITE_DASHBOARD_URL + "/verify",
    handleCodeInApp: true, // link contains oobCode
  };

  try {
    await sendSignInLinkToEmail(auth, userEmail, actionCodeSettings);
    console.log("Verification email sent to", userEmail);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    throw err;
  }
}
