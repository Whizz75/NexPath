// src/pages/institute/Admissions.jsx
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Admissions() {
  const [faculties, setFaculties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [instituteId, setInstituteId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setInstituteId(user.uid);

      // Load faculties
      const facSnap = await getDocs(
        query(
          collection(db, "faculties"),
          where("instituteId", "==", user.uid),
          where("status", "==", "approved")
        )
      );
      const facData = facSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFaculties(facData);

      // Load courses under those faculties
      const courseIds = [];
      const coursesData = {};
      await Promise.all(
        facData.map(async (fac) => {
          const cSnap = await getDocs(
            query(
              collection(db, "courses"),
              where("facultyId", "==", fac.id),
              where("status", "==", "approved")
            )
          );
          const cList = cSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          coursesData[fac.id] = cList;
          cList.forEach((c) => courseIds.push(c.id));
        })
      );

      // Load applications for those courses
      let allApps = [];
      if (courseIds.length > 0) {
        const appSnap = await getDocs(
          query(collection(db, "applications"), where("courseId", "in", courseIds))
        );
        allApps = appSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      // Filter: only show admitted or waitlisted if not admitted
      const filteredApps = [];
      const seenStudents = new Set();
      allApps.forEach((app) => {
        if (!seenStudents.has(app.studentId)) {
          if (app.status === "admitted") {
            filteredApps.push(app);
            seenStudents.add(app.studentId);
          } else if (app.status === "waitlisted") {
            // add waitlisted only if student has no admitted yet
            const hasAdmitted = allApps.some(
              (a) => a.studentId === app.studentId && a.status === "admitted"
            );
            if (!hasAdmitted) {
              filteredApps.push(app);
              seenStudents.add(app.studentId);
            }
          }
        }
      });

      setApplications(filteredApps);

      // Load student profiles
      const studentIds = [...new Set(filteredApps.map((a) => a.studentId))];
      const studentData = {};
      await Promise.all(
        studentIds.map(async (sid) => {
          const sDoc = await getDoc(doc(db, "students", sid));
          if (sDoc.exists()) studentData[sid] = sDoc.data();
        })
      );
      setStudents(studentData);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-20 text-muted-foreground">Loading admissions...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Admissions Overview</h1>

      {faculties.map((fac) => (
        <Card key={fac.id} className="bg-card text-card-foreground border border-border shadow-md">
          <CardHeader>
            <CardTitle>{fac.name} - Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications
              .filter((a) => a.facultyId === fac.id)
              .map((app) => {
                const student = students[app.studentId];
                if (!student) return null;

                return (
                  <Card key={app.id} className="border border-border p-4 rounded-lg bg-muted/10">
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <p><strong>Phone:</strong> {student.phone}</p>
                    <p><strong>Institution:</strong> {student.institution}</p>
                    {student.results && (
                      <div className="mt-2">
                        <strong>Results:</strong>
                        <ul className="list-disc ml-5">
                          {Object.entries(student.results).map(([subject, grade]) => (
                            <li key={subject}>
                              {subject}: {typeof grade === "object" ? grade.grade : grade}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="mt-2"><strong>Status:</strong> {app.status}</p>
                  </Card>
                );
              })}
            {applications.filter((a) => a.facultyId === fac.id).length === 0 && (
              <p className="text-sm italic text-muted-foreground">No admitted or waitlisted students yet.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
