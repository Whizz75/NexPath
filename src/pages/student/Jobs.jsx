import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Jobs() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobsByIndustry, setJobsByIndustry] = useState({});
  const [appliedJobs, setAppliedJobs] = useState({}); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return setLoading(false);

      try {
        const profileRef = doc(db, "students", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          setUserProfile(null);
          setLoading(false);
          return;
        }

        const student = profileSnap.data();
        setUserProfile(student);

        if (student.userType === "graduate") {
          const jobsSnap = await getDocs(
            query(collection(db, "jobs"), where("status", "==", "Open"))
          );

          const allJobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

          const grouped = {};
          allJobs.forEach((job) => {
            const category = job.industry || "Other";
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(job);
          });

          setJobsByIndustry(grouped);

          const appsSnap = await getDocs(
            query(
              collection(db, "jobApplications"),
              where("studentId", "==", user.uid)
            )
          );

          const applied = {};
          appsSnap.docs.forEach((doc) => {
            const data = doc.data();
            applied[data.jobId] = true;
          });

          setAppliedJobs(applied);
        }
      } catch (err) {
        console.error("Error loading jobs or profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleApply = async (jobId) => {
    if (!userProfile) return;

    if (appliedJobs[jobId]) {
      alert("You have already applied to this job.");
      return;
    }

    try {
      await addDoc(collection(db, "jobApplications"), {
        studentId: auth.currentUser.uid,
        studentName: userProfile.fullName || userProfile.name,
        jobId,
        appliedAt: new Date(),
        status: "Pending",
      });

      setAppliedJobs({ ...appliedJobs, [jobId]: true });
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Failed to apply:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading jobs...
      </div>
    );

  if (!userProfile)
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
        <p>Please log in to see available jobs.</p>
      </div>
    );

  if (userProfile.userType !== "graduate")
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
        <p className="text-lg">
          Jobs are only available for graduates — keep pushing forward!
        </p>
      </div>
    );

  return (
    <div className="p-6 md:p-10 space-y-10 w-full max-w-7xl mx-auto text-slate-100">
      <header>
        <h1 className="text-3xl font-bold text-teal-400 mb-2">Available Jobs</h1>
        <p className="text-slate-400">
          Browse real openings from verified companies.
        </p>
      </header>

      {Object.keys(jobsByIndustry).length === 0 ? (
        <p className="text-slate-500 italic text-center">
          No jobs available at the moment.
        </p>
      ) : (
        Object.entries(jobsByIndustry).map(([industry, jobs]) => (
          <section key={industry} className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-teal-500 border-b border-slate-700 pb-1">
                {industry}
              </h2>
              <span className="text-sm text-slate-500">
                {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => {
                const alreadyApplied = appliedJobs[job.id] || false;

                return (
                  <Card
                    key={job.id}
                    className="bg-slate-900/80 backdrop-blur-sm border border-teal-600 hover:border-teal-400 transition rounded-2xl shadow-md hover:shadow-teal-800/20"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-100">
                        {job.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-slate-400">
                      <p>
                        <strong className="text-slate-300">Company:</strong>{" "}
                        {job.companyName || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-300">Experience:</strong>{" "}
                        {job.experience ? `${job.experience} yrs` : "Not specified"}
                      </p>
                      <p>
                        <strong className="text-slate-300">Salary:</strong>{" "}
                        {job.salary ? `M${job.salary}` : "Not specified"}
                      </p>
                      <div className="flex justify-between text-sm pt-1">
                        <span>
                          <strong className="text-slate-300">Min GPA:</strong>{" "}
                          {job.minGPA || "N/A"}
                        </span>
                        <span>
                          <strong className="text-slate-300">Course:</strong>{" "}
                          {job.preferredCourse || "Any"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-3">
                        {job.description || "No description provided."}
                      </p>

                      <Button
                        className={`mt-3 w-full ${
                          alreadyApplied
                            ? "bg-slate-700 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-500"
                        } text-white transition`}
                        disabled={alreadyApplied}
                        onClick={() => handleApply(job.id)}
                      >
                        {alreadyApplied ? "Applied" : "Apply Now"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
