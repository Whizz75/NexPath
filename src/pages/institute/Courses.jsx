// src/pages/institute/Courses.jsx
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
  const [newCourse, setNewCourse] = useState({ name: "", code: "", description: "", facultyId: "" });
  const [modalCourse, setModalCourse] = useState(null);

  // Fetch faculties and courses
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const uid = user.uid;
      setInstituteId(uid);

      const facQuery = query(collection(db, "faculties"), where("instituteId", "==", uid));
      const unsubFacs = onSnapshot(facQuery, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFaculties(data);
        // Set default faculty for new course if not set
        const approved = data.filter(f => f.status === "approved");
        if (approved.length > 0 && !newCourse.facultyId) {
          setNewCourse(prev => ({ ...prev, facultyId: approved[0].id }));
        }
      });

      const courseQuery = query(collection(db, "courses"), where("instituteId", "==", uid));
      const unsubCourses = onSnapshot(courseQuery, (snap) => {
        setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubFacs();
        unsubCourses();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const approvedFaculties = faculties.filter(f => f.status === "approved");

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code || !newCourse.facultyId) {
      alert("Please fill all fields and select an approved faculty.");
      return;
    }

    await addDoc(collection(db, "courses"), {
      ...newCourse,
      instituteId,
      createdAt: serverTimestamp(),
      status: "pending"
    });

    setNewCourse({
      name: "",
      code: "",
      description: "",
      facultyId: approvedFaculties[0]?.id || ""
    });
  };

  const handleUpdateCourse = async () => {
    if (!modalCourse.name || !modalCourse.code || !modalCourse.facultyId) {
      alert("Please fill all fields and select an approved faculty.");
      return;
    }

    await updateDoc(doc(db, "courses", modalCourse.id), {
      name: modalCourse.name,
      code: modalCourse.code,
      description: modalCourse.description,
      facultyId: modalCourse.facultyId
    });

    setModalCourse(null);
  };

  const handleDeleteCourse = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteDoc(doc(db, "courses", id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Courses Management</h1>

      {/* Add new course */}
      <Card className="bg-card text-card-foreground border border-border shadow">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

          <Select
            value={newCourse.facultyId}
            onValueChange={(v) => setNewCourse({ ...newCourse, facultyId: v })}
            disabled={approvedFaculties.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Faculty" />
            </SelectTrigger>
            <SelectContent>
              {approvedFaculties.length > 0
                ? approvedFaculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)
                : <SelectItem value="none" disabled>No approved faculties</SelectItem>}
            </SelectContent>
          </Select>

          <Button onClick={handleAddCourse} className="w-full" disabled={approvedFaculties.length === 0}>
            Add Course
          </Button>
        </CardContent>
      </Card>

      {/* Courses grouped by faculty */}
      {approvedFaculties.map(fac => (
        <Card key={fac.id} className="bg-card text-card-foreground border border-border shadow">
          <CardHeader>
            <CardTitle>{fac.name} - Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {courses.filter(c => c.facultyId === fac.id).length > 0 ? (
              courses.filter(c => c.facultyId === fac.id).map(c => (
                <div key={c.id} className="flex justify-between items-center border-b border-border py-1">
                  <div>
                    <p className="font-semibold">{c.name} ({c.code})</p>
                    <p className="text-sm text-muted-foreground">{c.description || "No description"}</p>
                  </div>
                  <div className="flex gap-2">
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

      {/* Edit Modal */}
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
            <Select
              value={modalCourse.facultyId}
              onValueChange={(v) => setModalCourse({ ...modalCourse, facultyId: v })}
              disabled={approvedFaculties.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                {approvedFaculties.length > 0
                  ? approvedFaculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)
                  : <SelectItem value="none" disabled>No approved faculties</SelectItem>}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setModalCourse(null)}>Cancel</Button>
              <Button onClick={handleUpdateCourse}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
