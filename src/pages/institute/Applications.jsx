// src/pages/institute/Applications.jsx
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instituteId, setInstituteId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setInstituteId(user.uid);

      // Load courses
      const coursesSnap = await getDocs(
        query(collection(db, "courses"), where("instituteId", "==", user.uid))
      );
      const coursesData = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCourses(coursesData);

      // Load faculties
      const facIds = [...new Set(coursesData.map((c) => c.facultyId))];
      let facultiesData = [];
      for (let fid of facIds) {
        const facSnap = await getDocs(
          query(collection(db, "faculties"), where("__name__", "==", fid))
        );
        facSnap.forEach((doc) => facultiesData.push({ id: doc.id, ...doc.data() }));
      }
      setFaculties(facultiesData);

      // Load applications for all courses
      let apps = [];
      for (let course of coursesData) {
        const appSnap = await getDocs(
          query(collection(db, "applications"), where("courseId", "==", course.id))
        );
        apps = [...apps, ...appSnap.docs.map((d) => ({ id: d.id, ...d.data() }))];
      }
      setApplications(apps);

      // Load student info
      const studentIds = [...new Set(apps.map((a) => a.studentId))];
      let studentsData = [];
      for (let sid of studentIds) {
        const studentDoc = await getDocs(
          query(collection(db, "students"), where("__name__", "==", sid))
        );
        studentDoc.forEach((doc) => studentsData.push({ id: doc.id, ...doc.data() }));
      }
      setStudents(studentsData);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStudent = (id) => students.find((s) => s.id === id) || { name: "Unknown" };
  const getCourse = (id) => courses.find((c) => c.id === id) || { name: "Unknown" };

  const updateApplicationStatus = async (appId, status) => {
    const appToUpdate = applications.find((a) => a.id === appId);
    if (!appToUpdate) return;

    await updateDoc(doc(db, "applications", appId), { status });

    // Automatically reject other applications of the student if admitted
    if (status === "admitted") {
      const otherApps = applications.filter(
        (a) =>
          a.studentId === appToUpdate.studentId &&
          a.instituteId === appToUpdate.instituteId &&
          a.id !== appId
      );

      for (let oa of otherApps) {
        await updateDoc(doc(db, "applications", oa.id), { status: "rejected" });
      }

      setApplications((prev) =>
        prev.map((a) => {
          if (a.id === appId) return { ...a, status };
          if (otherApps.some((oa) => oa.id === a.id)) return { ...a, status: "rejected" };
          return a;
        })
      );
    } else {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
    }

    toast.success(`Application ${status}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">
        Student Applications
      </h1>

      {faculties.length === 0 ? (
        <p className="text-muted-foreground italic">No faculties found</p>
      ) : (
        faculties.map((fac) => (
          <div key={fac.id} className="space-y-4">
            <h2 className="text-xl font-semibold text-secondary">{fac.name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {applications
                .filter((app) => {
                  const course = getCourse(app.courseId);
                  return course.facultyId === fac.id;
                })
                .map((app) => {
                  const student = getStudent(app.studentId);
                  const course = getCourse(app.courseId);
                  const approved =
                    app.status === "admitted" ||
                    app.status === "rejected" ||
                    app.status === "waitlisted";

                  return (
                    <Card
                      key={app.id}
                      className="bg-card text-card-foreground border border-border shadow-md hover:shadow-lg transition"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Course: <span className="text-foreground">{course.name}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current Status:{" "}
                          <span
                            className={`font-semibold ${
                              app.status === "pending"
                                ? "text-yellow-500"
                                : app.status === "admitted"
                                ? "text-green-500"
                                : app.status === "rejected"
                                ? "text-red-500"
                                : "text-blue-500"
                            }`}
                          >
                            {app.status || "pending"}
                          </span>
                        </p>

                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-500 border-green-500 hover:bg-green-500/10 disabled:opacity-50"
                            onClick={() => updateApplicationStatus(app.id, "admitted")}
                            disabled={approved}
                          >
                            Admit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-500/10 disabled:opacity-50"
                            onClick={() => updateApplicationStatus(app.id, "rejected")}
                            disabled={approved}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-500 border-blue-500 hover:bg-blue-500/10 disabled:opacity-50"
                            onClick={() => updateApplicationStatus(app.id, "waitlisted")}
                            disabled={approved}
                          >
                            Waitlist
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
