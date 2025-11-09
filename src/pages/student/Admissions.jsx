// src/pages/student/Admissions.jsx
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [institutions, setInstitutions] = useState({});
  const [faculties, setFaculties] = useState({});
  const [courses, setCourses] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setUserId(user.uid);

      // Load all institutions
      const instSnap = await getDocs(collection(db, "institutes"));
      const instData = {};
      instSnap.docs.forEach((d) => (instData[d.id] = d.data()));
      setInstitutions(instData);

      // Load all faculties
      const facSnap = await getDocs(collection(db, "faculties"));
      const facData = {};
      facSnap.docs.forEach((d) => (facData[d.id] = d.data()));
      setFaculties(facData);

      // Load all courses
      const courseSnap = await getDocs(collection(db, "courses"));
      const courseData = {};
      courseSnap.docs.forEach((d) => (courseData[d.id] = d.data()));
      setCourses(courseData);

      // Load student applications
      const appSnap = await getDocs(
        query(collection(db, "applications"), where("studentId", "==", user.uid))
      );
      const appData = appSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setAdmissions(appData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-20 text-muted-foreground">Loading admissions...</p>;

  return (
    <div className="p-6 space-y-6 w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-4">My Admissions</h1>

      <Card className="bg-card text-card-foreground border border-border shadow-md">
        <CardHeader>
          <CardTitle>Admissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-2 text-left">Institution</th>
                  <th className="border border-border p-2 text-left">Faculty</th>
                  <th className="border border-border p-2 text-left">Course</th>
                  <th className="border border-border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {admissions.length > 0 ? (
                  admissions.map((app) => {
                    const inst = institutions[app.instituteId]?.name || "Unknown";
                    const fac = faculties[app.facultyId]?.name || "Unknown";
                    const course = courses[app.courseId]?.name || "Unknown";

                    return (
                      <tr key={app.id}>
                        <td className="border border-border p-2">{inst}</td>
                        <td className="border border-border p-2">{fac}</td>
                        <td className="border border-border p-2">{course}</td>
                        <td
                          className={`border border-border p-2 font-semibold ${
                            app.status === "admitted"
                              ? "text-green-600"
                              : app.status === "waitlisted"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {app.status}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-border p-2 text-center italic text-muted-foreground">
                      No admissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
