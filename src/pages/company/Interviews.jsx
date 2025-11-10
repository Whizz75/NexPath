import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function Interviews() {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState("New");
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [form, setForm] = useState({
    scheduledAt: "",
    mode: "Online",
    location: "",
    notes: "",
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "interviews"), where("companyId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInterviews(data);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "jobApplications"), where("status", "==", "Accepted"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appsRaw = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

      const appsWithJob = await Promise.all(
        appsRaw.map(async (app) => {
          try {
            const jobDoc = await getDoc(doc(db, "jobs", app.jobId));
            return {
              ...app,
              jobTitle: jobDoc.exists() ? jobDoc.data().title : "Unknown Job",
            };
          } catch (err) {
            console.error("Failed to fetch job for application", app.id, err);
            return { ...app, jobTitle: "Unknown Job" };
          }
        })
      );

      setApplications(appsWithJob);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSchedule = async () => {
    if (!selectedApplicationId || !form.scheduledAt)
      return alert("Select an applicant and date/time.");

    const app = applications.find((a) => a.id === selectedApplicationId);
    if (!app) return;

    try {
      const interviewRef = await addDoc(collection(db, "interviews"), {
        applicationId: selectedApplicationId,
        studentId: app.studentId || app.uid,
        studentName: app.studentName,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        companyId: user.uid,
        scheduledAt: Timestamp.fromDate(new Date(form.scheduledAt)),
        mode: form.mode,
        location: form.location,
        notes: form.notes,
        status: "Pending",
        createdAt: Timestamp.now(),
      });

      await addDoc(collection(db, "notifications"), {
        studentId: app.studentId || app.uid,
        title: "New Interview Scheduled",
        message: `You have a new interview for "${app.jobTitle}" scheduled on ${new Date(
          form.scheduledAt
        ).toLocaleString()}.`,
        type: "interview",
        interviewId: interviewRef.id,
        read: false,
        createdAt: Timestamp.now(),
      });

      alert("Interview scheduled successfully. Student will be notified.");
      setShowModal(false);
      setSelectedApplicationId("");
      setForm({
        scheduledAt: "",
        mode: "Online",
        location: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview.");
    }
  };

  const filteredInterviews = interviews.filter((i) =>
    tab === "New" ? i.status === "Pending" : i.status !== "Pending"
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-teal-400">Interviews</h1>
        <Button onClick={() => setShowModal(true)}>Schedule Interview</Button>
      </div>

      <div className="flex space-x-4 border-b border-slate-700">
        <button
          onClick={() => setTab("New")}
          className={`pb-2 ${tab === "New" ? "border-b-2 border-teal-400 font-semibold" : ""}`}
        >
          New
        </button>
        <button
          onClick={() => setTab("Reviewed")}
          className={`pb-2 ${tab === "Reviewed" ? "border-b-2 border-teal-400 font-semibold" : ""}`}
        >
          Reviewed
        </button>
      </div>

      {filteredInterviews.length === 0 ? (
        <p className="text-gray-400 text-center mt-6">No interviews in this tab.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {filteredInterviews.map((i) => (
            <Card
              key={i.id}
              className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 shadow-lg"
            >
              <CardContent className="p-6 space-y-2">
                <h3 className="text-lg font-semibold text-teal-400">{i.studentName}</h3>
                <p className="text-sm text-slate-300">
                  <strong>Job:</strong> {i.jobTitle}
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Scheduled At:</strong> {i.scheduledAt?.toDate().toLocaleString() || "N/A"}
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Mode:</strong> {i.mode}
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Status:</strong> {i.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-900 p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-teal-400">Schedule Interview</h2>

            <div>
              <Label>Applicant</Label>
              <Select value={selectedApplicationId} onValueChange={setSelectedApplicationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select applicant" />
                </SelectTrigger>
                <SelectContent>
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.studentName} — {app.jobTitle}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>No applicants</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <Label>Mode</Label>
              <Select
                value={form.mode}
                onValueChange={(value) => setForm({ ...form, mode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="In-person">In-person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location</Label>
              <Input
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Optional if online"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Optional notes"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowModal(false)} className="bg-gray-600 hover:bg-gray-500">
                Cancel
              </Button>
              <Button onClick={handleSchedule} className="bg-teal-600 hover:bg-teal-500">
                Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
