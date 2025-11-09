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
  orderBy,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { role } = useAuth();

  useEffect(() => {
    if (role !== "admin") return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(allUsers);
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
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-semibold">
        Access Denied
      </div>
    );
  }

  const filteredRequests = requests.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-semibold tracking-wide text-primary">
          Access Management
        </h1>

        <div className="flex gap-3">
          {["pending", "approved", "denied"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "default" : "outline"}
              className={`capitalize ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 animate-pulse">Fetching access requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-slate-400">No {filter} requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <Card
              key={req.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-primary/50 transition-all"
            >
              <CardHeader>
                <CardTitle className="text-lg font-medium flex justify-between">
                  {req.name || "Unnamed User"}
                  <span
                    className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      req.status === "approved"
                        ? "bg-green-600/20 text-green-400"
                        : req.status === "denied"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-slate-300">Email:</span>{" "}
                  {req.email}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">Role:</span>{" "}
                  {req.role}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">Created:</span>{" "}
                  {req.createdAt
                    ? new Date(req.createdAt.seconds * 1000).toLocaleString()
                    : "-"}
                </p>

                {filter === "pending" && (
                  <div className="flex gap-2 pt-3">
                    <Button
                      onClick={() => handleAction(req.id, "approved")}
                      disabled={actionLoading === req.id}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {actionLoading === req.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleAction(req.id, "denied")}
                      disabled={actionLoading === req.id}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      {actionLoading === req.id ? "Processing..." : "Deny"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
