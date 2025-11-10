import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const jobsQuery = query(collection(db, "jobs"), where("companyId", "==", user.uid));
    const unsubscribeJobs = onSnapshot(jobsQuery, (jobsSnapshot) => {
      const jobMap = jobsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = { ...doc.data(), id: doc.id };
        return acc;
      }, {});

      const applicationsQuery = collection(db, "jobApplications");
      const unsubscribeApps = onSnapshot(applicationsQuery, async (appsSnapshot) => {
        const filteredApps = appsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((app) => app.jobId && jobMap[app.jobId]);

        const formattedApps = await Promise.all(
          filteredApps.map(async (app) => {
            let studentData = {};
            try {
              if (app.studentId) {
                const studentRef = doc(db, "students", app.studentId);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) studentData = studentSnap.data();
              }
            } catch (err) {
              console.error("Error loading student data:", err);
            }

            return {
              id: app.id,
              job: jobMap[app.jobId],
              studentName: app.studentName || studentData.name || "Unknown",
              studentId: app.studentId,
              qualifications: studentData.qualifications || [],
              skills: studentData.skills || [],
              appliedAt: app.appliedAt?.toDate?.() || null,
              status: app.status || "Pending",
            };
          })
        );

        setApplicants(formattedApps);
        setLoading(false);
      });

      return () => unsubscribeApps();
    });

    return () => unsubscribeJobs();
  }, [user]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await updateDoc(doc(db, "jobApplications", appId), { status });
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating application status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading applicants...
      </div>
    );
  }

  const filteredApplicants =
    activeTab === "new"
      ? applicants.filter((a) => a.status === "Pending")
      : applicants.filter((a) => a.status !== "Pending");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-teal-400">
        Applicants for Your Jobs
      </h1>

      <div className="flex space-x-4 mb-4">
        <Button
          variant={activeTab === "new" ? "default" : "ghost"}
          onClick={() => setActiveTab("new")}
        >
          New
        </Button>
        <Button
          variant={activeTab === "reviewed" ? "default" : "ghost"}
          onClick={() => setActiveTab("reviewed")}
        >
          Reviewed
        </Button>
      </div>

      {filteredApplicants.length === 0 ? (
        <p className="text-gray-400 text-center">No applicants in this tab.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplicants.map((app) => {
            const jobRequirements = (app.job.certificates || "")
              .split(",")
              .map((c) => c.trim().toLowerCase());

            const studentProfile = [
              ...(app.qualifications || []),
              ...(app.skills || []),
            ].map((s) => s.trim().toLowerCase());

            const matches = studentProfile.filter((s) => jobRequirements.includes(s));

            return (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Card className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 shadow-lg transition">
                  <CardContent className="p-6 space-y-2">
                    <h3 className="text-lg font-semibold text-teal-400">
                      {app.studentName}
                    </h3>
                    <p className="text-sm text-slate-300">
                      <strong>Applied for:</strong> {app.job.title}
                    </p>
                    <p className="text-sm text-slate-300">
                      <strong>Status:</strong> {app.status}
                    </p>
                    {app.appliedAt && (
                      <p className="text-xs text-slate-500">
                        Applied on: {app.appliedAt.toLocaleDateString()}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Job Requirements:</strong>{" "}
                      {app.job.certificates || "None"}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Student Qualifications & Skills:</strong>{" "}
                      {studentProfile.length > 0
                        ? studentProfile.join(", ")
                        : "None"}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Matches:</strong>{" "}
                      {matches.length > 0 ? matches.join(", ") : "None"}
                    </p>

                    {app.status === "Pending" && (
                      <div className="flex space-x-2 mt-3">
                        <Button
                          className="bg-green-600 hover:bg-green-500"
                          onClick={() => handleStatusUpdate(app.id, "Accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-500"
                          onClick={() => handleStatusUpdate(app.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
