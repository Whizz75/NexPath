import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Clock } from "lucide-react";

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
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`capitalize px-3 py-1 rounded ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
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
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex-1">
                  {req.name || "Unnamed User"}
                </CardTitle>
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

                <div className="flex gap-3 pt-3 justify-center">
                  <CheckCircle
                    size={24}
                    className={`cursor-pointer ${
                      req.status === "approved" ? "text-green-400" : "text-slate-400 hover:text-green-400"
                    }`}
                    onClick={() => handleAction(req.id, "approved")}
                  />
                  <XCircle
                    size={24}
                    className={`cursor-pointer ${
                      req.status === "denied" ? "text-red-400" : "text-slate-400 hover:text-red-400"
                    }`}
                    onClick={() => handleAction(req.id, "denied")}
                  />
                  <Clock
                    size={24}
                    className={`cursor-pointer ${
                      req.status === "pending" ? "text-yellow-400" : "text-slate-400 hover:text-yellow-400"
                    }`}
                    onClick={() => handleAction(req.id, "pending")}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
