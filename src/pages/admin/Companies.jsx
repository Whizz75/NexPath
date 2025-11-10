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

function SuspendDialog({ companyId, onConfirm }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setReason("")}
        >
          Suspend
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Suspend Company</DialogTitle>
          <DialogDescription>
            Provide a reason for suspending this company.
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
                onConfirm(companyId, "suspended", reason);
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

function ReactivationDialog({ company, onReactivate }) {
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
            The company submitted the following message for reactivation:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Textarea value={company.reactivationMessage || ""} readOnly rows={4} />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                onReactivate(company.id);
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

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "companies"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCompanies(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status, reason = "") => {
    try {
      const compRef = doc(db, "companies", id);
      await updateDoc(compRef, {
        status,
        ...(status === "suspended" && { suspensionReason: reason }),
        updatedAt: serverTimestamp(),
      });

      alert(
        status === "suspended"
          ? "Company has been suspended."
          : `Company ${status}!`
      );
    } catch (err) {
      console.error("Failed to update company status:", err);
      alert("Could not update company status.");
    }
  };

  const reactivateCompany = async (id) => {
    try {
      const compRef = doc(db, "companies", id);
      await updateDoc(compRef, {
        status: "approved",
        reactivationRequested: false,
        reactivationMessage: "",
        updatedAt: serverTimestamp(),
      });
      alert("Company reactivated!");
    } catch (err) {
      console.error("Failed to reactivate company:", err);
      alert("Could not reactivate company.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading companies...
      </p>
    );

  const pendingCompanies = companies.filter((c) => c.status === "pending");
  const approvedCompanies = companies.filter((c) => c.status === "approved");
  const suspendedCompanies = companies.filter((c) => c.status === "suspended");

  return (
    <div className="p-6 bg-slate-900 min-h-screen space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingCompanies.length === 0 ? (
            <p className="text-muted-foreground">No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCompanies.map((c) => (
                <Card key={c.id} className="bg-card border border-border">
                  <CardContent>
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <p className="text-muted-foreground">{c.address || "No address provided"}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => updateStatus(c.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(c.id, "denied")}
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

      <Card>
        <CardHeader>
          <CardTitle>Approved Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedCompanies.length === 0 ? (
            <p className="text-muted-foreground">No approved companies yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedCompanies.map((c) => (
                <Card key={c.id} className="bg-card border border-border">
                  <CardContent>
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <p className="text-muted-foreground">{c.address || "No address provided"}</p>
                    <div className="flex gap-2 mt-2">
                      <SuspendDialog companyId={c.id} onConfirm={updateStatus} />
                      {c.reactivationRequested && (
                        <ReactivationDialog company={c} onReactivate={reactivateCompany} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suspended Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suspendedCompanies.length === 0 ? (
            <p className="text-muted-foreground">No suspended companies.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suspendedCompanies.map((c) => (
                <Card key={c.id} className="bg-card border border-border">
                  <CardContent>
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <p className="text-muted-foreground">{c.address || "No address provided"}</p>
                    <p className="text-red-500 mt-1">
                      Reason: {c.suspensionReason || "No reason provided"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {c.reactivationRequested && (
                        <ReactivationDialog company={c} onReactivate={reactivateCompany} />
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
