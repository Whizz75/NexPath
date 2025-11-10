import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [instituteId, setInstituteId] = useState(null);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    facultyId: "",
    maxStudents: "",
    minRequirements: {
      PhysicalScience: "",
      Maths: "",
      English: "",
      Sesotho: "",
      Biology: "",
    },
  });
  const [modalCourse, setModalCourse] = useState(null);

  const gradeOptions = ["A", "B", "C", "D", "E", "F"];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const uid = user.uid;
      setInstituteId(uid);

      const facQuery = query(collection(db, "faculties"), where("instituteId", "==", uid));
      const unsubFacs = onSnapshot(facQuery, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFaculties(data);
        const approved = data.filter((f) => f.status === "approved");
        if (approved.length > 0 && !newCourse.facultyId) {
          setNewCourse((prev) => ({ ...prev, facultyId: approved[0].id }));
        }
      });

      const courseQuery = query(collection(db, "courses"), where("instituteId", "==", uid));
      const unsubCourses = onSnapshot(courseQuery, (snap) => {
        setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubFacs();
        unsubCourses();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const approvedFaculties = faculties.filter((f) => f.status === "approved");

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code || !newCourse.facultyId) {
      alert("Please fill all required fields.");
      return;
    }

    await addDoc(collection(db, "courses"), {
      ...newCourse,
      instituteId,
      createdAt: serverTimestamp(),
      status: "pending",
    });

    setNewCourse({
      name: "",
      code: "",
      description: "",
      facultyId: approvedFaculties[0]?.id || "",
      maxStudents: "",
      minRequirements: {
        PhysicalScience: "",
        Maths: "",
        English: "",
        Sesotho: "",
        Biology: "",
      },
    });
  };

  const handleUpdateCourse = async () => {
    if (!modalCourse.name || !modalCourse.code || !modalCourse.facultyId) {
      alert("Please fill all required fields.");
      return;
    }

    await updateDoc(doc(db, "courses", modalCourse.id), {
      name: modalCourse.name,
      code: modalCourse.code,
      description: modalCourse.description,
      facultyId: modalCourse.facultyId,
      maxStudents: modalCourse.maxStudents,
      minRequirements: modalCourse.minRequirements,
    });

    setModalCourse(null);
  };

  const handleDeleteCourse = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteDoc(doc(db, "courses", id));
    }
  };

  const handleMinRequirementChange = (subject, value, target) => {
    target((prev) => ({
      ...prev,
      minRequirements: { ...prev.minRequirements, [subject]: value },
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Courses Management</h1>

      <Card className="bg-card border border-border shadow">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Course Name"
            value={newCourse.name}
            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
          />
          <Input
            placeholder="Course Code"
            value={newCourse.code}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
          />
          <Input
            placeholder="Description (optional)"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Maximum Students Allowed"
            value={newCourse.maxStudents}
            onChange={(e) => setNewCourse({ ...newCourse, maxStudents: e.target.value })}
          />

          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-semibold mb-2 text-primary">
              Minimum Subject Requirements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(newCourse.minRequirements).map((subject) => (
                <div key={subject} className="space-y-1">
                  <label className="text-sm text-muted-foreground">{subject}</label>
                  <Select
                    value={newCourse.minRequirements[subject]}
                    onValueChange={(v) =>
                      handleMinRequirementChange(subject, v, setNewCourse)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Faculty</label>
            <Select
              value={newCourse.facultyId}
              onValueChange={(v) => setNewCourse({ ...newCourse, facultyId: v })}
              disabled={approvedFaculties.length === 0}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                {approvedFaculties.length > 0 ? (
                  approvedFaculties.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No approved faculties
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddCourse}
            className="w-full"
            disabled={approvedFaculties.length === 0}
          >
            Add Course
          </Button>
        </CardContent>
      </Card>

      {approvedFaculties.map((fac) => (
        <Card key={fac.id} className="bg-card border border-border shadow">
          <CardHeader>
            <CardTitle>{fac.name} - Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.filter((c) => c.facultyId === fac.id).length > 0 ? (
              courses
                .filter((c) => c.facultyId === fac.id)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-2"
                  >
                    <div>
                      <p className="font-semibold">
                        {c.name} ({c.code})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c.description || "No description"}
                      </p>
                      <p className="text-sm text-accent mt-1">
                        Max Students: {c.maxStudents || "Not set"}
                      </p>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Min Requirements:{" "}
                        {Object.entries(c.minRequirements || {}).map(([subj, grade]) => (
                          <span key={subj} className="mr-2">
                            {subj}: {grade || "—"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModalCourse(c)}
                        className="text-blue-500 border-blue-500 hover:bg-blue-500/10"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(c.id)}
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No courses yet</p>
            )}
          </CardContent>
        </Card>
      ))}

      {modalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-2xl w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-primary">Edit Course</h2>
            <Input
              placeholder="Course Name"
              value={modalCourse.name}
              onChange={(e) => setModalCourse({ ...modalCourse, name: e.target.value })}
            />
            <Input
              placeholder="Course Code"
              value={modalCourse.code}
              onChange={(e) => setModalCourse({ ...modalCourse, code: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={modalCourse.description}
              onChange={(e) => setModalCourse({ ...modalCourse, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Maximum Students Allowed"
              value={modalCourse.maxStudents || ""}
              onChange={(e) =>
                setModalCourse({ ...modalCourse, maxStudents: e.target.value })
              }
            />

            <div>
              <h3 className="text-sm font-semibold mb-2">Minimum Requirements</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(modalCourse.minRequirements || {}).map((subject) => (
                  <div key={subject} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{subject}</label>
                    <Select
                      value={modalCourse.minRequirements[subject]}
                      onValueChange={(v) =>
                        handleMinRequirementChange(subject, v, setModalCourse)
                      }
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setModalCourse(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCourse}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
