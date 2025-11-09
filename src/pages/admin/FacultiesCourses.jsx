// src/pages/admin/FacultiesCourses.jsx
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FacultiesCourses() {
  const [institutes, setInstitutes] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data live
  useEffect(() => {
    const unsubInst = onSnapshot(collection(db, "institutes"), (snap) => {
      setInstitutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubFac = onSnapshot(collection(db, "faculties"), (snap) => {
      setFaculties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubCourse = onSnapshot(collection(db, "courses"), (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => {
      unsubInst();
      unsubFac();
      unsubCourse();
    };
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "courses", id), { status: newStatus });
    toast.success(
      `Course ${newStatus === "approved" ? "approved ✅" : "rejected ❌"}`
    );
  };

  const handleEdit = (course) => {
    // Placeholder for edit modal
    console.log("Edit course:", course);
    toast.info(`Edit mode for ${course.name} coming soon`);
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
        Course Approval Management
      </h1>

      {institutes.map((inst) => {
        const instFaculties = faculties.filter(
          (f) => f.instituteId === inst.id
        );

        return (
          <Card
            key={inst.id}
            className="bg-card text-card-foreground border border-border shadow"
          >
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                {inst.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {instFaculties.length > 0 ? (
                instFaculties.map((fac) => {
                  const facCourses = courses.filter(
                    (c) => c.facultyId === fac.id
                  );

                  return (
                    <div
                      key={fac.id}
                      className="border border-border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h2 className="font-semibold text-lg">
                            Faculty: {fac.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Status:{" "}
                            <span
                              className={`font-medium ${
                                fac.status === "approved"
                                  ? "text-green-500"
                                  : fac.status === "rejected"
                                  ? "text-red-500"
                                  : "text-yellow-500"
                              }`}
                            >
                              {fac.status || "pending"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Courses under this faculty */}
                      <div className="ml-4 space-y-2">
                        {facCourses.length > 0 ? (
                          facCourses.map((course) => {
                            const approved = course.status === "approved";
                            const rejected = course.status === "rejected";

                            return (
                              <div
                                key={course.id}
                                className="flex justify-between items-center border border-border rounded-lg p-3 bg-background hover:shadow-sm transition"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {course.name}{" "}
                                    <span className="text-xs text-muted-foreground">
                                      ({course.code || "no code"})
                                    </span>
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Status:{" "}
                                    <span
                                      className={`font-medium ${
                                        approved
                                          ? "text-green-500"
                                          : rejected
                                          ? "text-red-500"
                                          : "text-yellow-500"
                                      }`}
                                    >
                                      {course.status || "pending"}
                                    </span>
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-500 border-green-500 hover:bg-green-500/10 disabled:opacity-50"
                                    disabled={approved || rejected}
                                    onClick={() =>
                                      updateStatus(course.id, "approved")
                                    }
                                  >
                                    Approve
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                    disabled={approved || rejected}
                                    onClick={() =>
                                      updateStatus(course.id, "rejected")
                                    }
                                  >
                                    Reject
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-500 border-blue-500 hover:bg-blue-500/10"
                                    onClick={() => handleEdit(course)}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No courses found under this faculty
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No faculties yet
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
