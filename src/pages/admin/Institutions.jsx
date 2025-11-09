import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  where,
} from "firebase/firestore";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function SuspendDialog({ instId, onConfirm }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setReason("")} // reset reason when opened
        >
          Suspend
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Suspend Institution</DialogTitle>
          <DialogDescription>
            Please provide a reason for suspending this institution.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Reason for suspension"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                if (!reason.trim()) return alert("Reason is required!");
                onConfirm(instId, "suspended", reason);
                setOpen(false);
              }}
            >
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReactivationDialog({ inst, onReactivate }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600">
          Reactivation Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reactivation Request</DialogTitle>
          <DialogDescription>
            The institution submitted the following message for reactivation:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Textarea value={inst.reactivationMessage || ""} readOnly rows={4} />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                onReactivate(inst.id);
                setOpen(false);
              }}
            >
              Reactivate
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "institutes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInstitutions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 Update institution status + batch update users under it
  const updateStatus = async (id, status, reason = "") => {
    try {
      const instRef = doc(db, "institutes", id);
      await updateDoc(instRef, {
        status,
        ...(status === "suspended" && { suspensionReason: reason }),
        updatedAt: serverTimestamp(),
      });

      // Batch update all users tied to this institution
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("institutionId", "==", id));
      const usersSnap = await getDocs(q);

      for (const userDoc of usersSnap.docs) {
        await updateDoc(userDoc.ref, {
          status: status === "suspended" ? "suspended" : "approved",
          ...(status === "suspended"
            ? { suspensionReason: reason }
            : { suspensionReason: "" }),
          updatedAt: serverTimestamp(),
        });
      }

      alert(
        status === "suspended"
          ? "Institution and all its users have been suspended."
          : `Institution ${status}!`
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Could not update institution status.");
    }
  };

  const reactivateInstitution = async (id) => {
    try {
      const instRef = doc(db, "institutes", id);
      await updateDoc(instRef, {
        status: "approved",
        reactivationRequested: false,
        reactivationMessage: "",
        updatedAt: serverTimestamp(),
      });

      // Reactivate all users under this institution
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("institutionId", "==", id));
      const usersSnap = await getDocs(q);

      for (const userDoc of usersSnap.docs) {
        await updateDoc(userDoc.ref, {
          status: "approved",
          suspensionReason: "",
          updatedAt: serverTimestamp(),
        });
      }

      alert("Institution and its users reactivated!");
    } catch (err) {
      console.error("Failed to reactivate:", err);
      alert("Could not reactivate institution.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading institutions...
      </p>
    );

  const pendingInstitutes = institutions.filter((i) => i.status === "pending");
  const approvedInstitutes = institutions.filter((i) => i.status === "approved");
  const suspendedInstitutes = institutions.filter((i) => i.status === "suspended");

  return (
    <div className="p-6 bg-slate-900 min-h-screen space-y-6">
      {/* Pending Institutions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Institutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingInstitutes.length === 0 ? (
            <p className="text-muted-foreground">No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInstitutes.map((inst) => (
                <Card key={inst.id} className="bg-card border border-border">
                  <CardContent>
                    <h3 className="font-semibold text-foreground">{inst.name}</h3>
                    <p className="text-muted-foreground">{inst.address}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => updateStatus(inst.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(inst.id, "denied")}
                      >
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Institutions */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Institutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedInstitutes.length === 0 ? (
            <p className="text-muted-foreground">No approved institutions yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedInstitutes.map((inst) => (
                <Card key={inst.id} className="bg-card border border-border">
                  <CardContent>
                    <h3 className="font-semibold text-foreground">{inst.name}</h3>
                    <p className="text-muted-foreground">{inst.address}</p>
                    <div className="flex gap-2 mt-2">
                      <SuspendDialog instId={inst.id} onConfirm={updateStatus} />
                      {inst.reactivationRequested && (
                        <ReactivationDialog
                          inst={inst}
                          onReactivate={reactivateInstitution}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspended Institutions */}
      <Card>
        <CardHeader>
          <CardTitle>Suspended Institutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suspendedInstitutes.length === 0 ? (
            <p className="text-muted-foreground">No suspended institutions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suspendedInstitutes.map((inst) => (
                <Card key={inst.id} className="bg-card border border-border">
                  <CardContent>
                    <h3 className="font-semibold text-foreground">{inst.name}</h3>
                    <p className="text-muted-foreground">{inst.address}</p>
                    <p className="text-red-500 mt-1">
                      Reason: {inst.suspensionReason || "No reason provided"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {inst.reactivationRequested && (
                        <ReactivationDialog
                          inst={inst}
                          onReactivate={reactivateInstitution}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
