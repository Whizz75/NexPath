// src/pages/admin/AccessRequests.jsx
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // track action per request
  const { role } = useAuth();

  useEffect(() => {
    if (role !== "admin") return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        const pendingUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(pendingUsers);
      } catch (err) {
        console.error("Error fetching access requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [role]);

  const handleAction = async (userId, action) => {
    setActionLoading(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: action,
        updatedAt: serverTimestamp(),
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === userId ? { ...r, status: action } : r))
      );
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Access Denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-100">Pending Access Requests</h1>

      {loading ? (
        <p className="text-slate-400">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-slate-400">No pending requests.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="bg-slate-900 text-slate-100">
              <CardHeader>
                <CardTitle>{request.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p>Email: {request.email}</p>
                <p>Role: {request.role}</p>
                <p>Status: {request.status}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(request.id, "approved")}
                    disabled={actionLoading === request.id}
                  >
                    {actionLoading === request.id && request.status !== "approved"
                      ? "Processing..."
                      : "Approve"}
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleAction(request.id, "denied")}
                    disabled={actionLoading === request.id}
                  >
                    {actionLoading === request.id && request.status !== "denied"
                      ? "Processing..."
                      : "Deny"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
