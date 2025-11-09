// src/pages/company/Profile.jsx
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";

export default function CompanyProfile() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [stats, setStats] = useState({ jobs: 0, applicants: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setUser(u);

      const compRef = doc(db, "companies", u.uid);
      const compDoc = await getDoc(compRef);

      if (compDoc.exists()) {
        setCompany(compDoc.data());
        setForm({
          name: compDoc.data().name || "",
          email: compDoc.data().email || "",
          phone: compDoc.data().phone || "",
          address: compDoc.data().address || "",
        });
      } else {
        setIsNew(true);
        setEditing(true);
      }

      // Count jobs and applicants
      const jobsSnap = await getDocs(
        query(collection(db, "jobs"), where("companyId", "==", u.uid))
      );
      let applicantCount = 0;
      for (const jobDoc of jobsSnap.docs) {
        const appsSnap = await getDocs(
          query(collection(db, "applications"), where("jobId", "==", jobDoc.id))
        );
        applicantCount += appsSnap.size;
      }

      setStats({ jobs: jobsSnap.size, applicants: applicantCount });
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and email are required!");
      return;
    }

    setSaving(true);
    try {
      const compRef = doc(db, "companies", user.uid);

      if (isNew) {
        await setDoc(compRef, {
          ...form,
          createdAt: serverTimestamp(),
          status: "pending",
          updateRequested: true,
        });
        await updateDoc(doc(db, "users", user.uid), {
          companyId: user.uid,
          updatedAt: serverTimestamp(),
        });
        setIsNew(false);
      } else {
        await updateDoc(compRef, {
          ...form,
          status: "pending",
          updateRequested: true,
          updatedAt: serverTimestamp(),
        });
      }

      setCompany({ ...form, status: "pending" });
      setEditing(false);
      alert("Profile submitted for admin approval!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="text-muted-foreground text-center mt-6">
        Loading profile...
      </p>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-primary text-center mb-4">
        {isNew ? "Set Up Your Company Profile" : "Company Profile"}
      </h1>

      <Card className="bg-card text-card-foreground border border-border shadow relative">
        {!editing && (
          <div
            className="absolute top-4 right-4 cursor-pointer"
            onClick={() => setEditing(true)}
          >
            <PencilIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        <CardHeader className="flex flex-col items-center space-y-2 pt-8">
          <img
            src={`https://ui-avatars.com/api/?name=${form.name || "Company"}&background=1AA7A3&color=fff&rounded=true`}
            alt="Company Avatar"
            className="w-20 h-20 rounded-full border border-border"
          />
          <CardTitle className="text-lg font-semibold text-center">
            {form.name || "Company Name"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-3">
              <Input
                placeholder="Company Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <div className="flex gap-2 mt-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving
                    ? "Submitting..."
                    : isNew
                    ? "Create Profile"
                    : "Submit Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Company Head:</span> {user.displayName || user.email}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {form.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {form.phone || "-"}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {form.address || "-"}
              </p>

              <div className="flex gap-4 mt-2">
                <p>
                  <span className="font-semibold">Total Jobs:</span> {stats.jobs}
                </p>
                <p>
                  <span className="font-semibold">Total Applicants:</span> {stats.applicants}
                </p>
              </div>

              <p>
                <span className="font-semibold">Profile Status:</span>{" "}
                {company?.status === "approved" ? "Approved" : "Pending Approval"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
