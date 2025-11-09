// src/pages/student/Jobs.jsx
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Jobs() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      // Load student profile
      const profileRef = doc(db, "students", user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setUserProfile(data);

        // Only load jobs for graduates
        if (data.userType === "graduate") {
          const jobsSnap = await getDocs(
            query(collection(db, "jobs"), where("status", "==", "approved"))
          );
          setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );

  if (!userProfile)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <p>Please log in to see available jobs.</p>
      </div>
    );

  if (userProfile.userType !== "graduate")
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <p className="text-lg">
          Jobs are available only for graduate students. Keep focusing on your studies!
        </p>
      </div>
    );

  return (
    <div className="p-6 space-y-6 w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-4">Available Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground italic">No jobs available at the moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-card text-card-foreground border border-border shadow-md hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Company:</strong> {job.company || "N/A"}</p>
                <p><strong>Location:</strong> {job.location || "Remote / N/A"}</p>
                <p><strong>Description:</strong> {job.description || "No description provided."}</p>
                <Button className="mt-2 w-full" onClick={() => alert("Application feature coming soon!")}>
                  Apply
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
