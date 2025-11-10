import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Faculties() {
  const [faculties, setFaculties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState({});

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      setUserId(user.uid);

      const q = query(collection(db, "faculties"), where("instituteId", "==", user.uid));
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFaculties(data);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    faculties.forEach((faculty) => {
      const q = query(collection(db, "courses"), where("facultyId", "==", faculty.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses((prev) => ({ ...prev, [faculty.id]: data }));
      });
      return () => unsubscribe();
    });
  }, [faculties]);

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        const ref = doc(db, "faculties", editingId);
        await updateDoc(ref, {
          name,
          description,
          status: "pending",
          updatedAt: serverTimestamp(),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "faculties"), {
          name,
          description,
          instituteId: userId,
          status: "pending",
          createdAt: serverTimestamp(),
        });
      }
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Error saving faculty:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setEditingId(faculty.id);
    setName(faculty.name);
    setDescription(faculty.description);
  };

  const handleDelete = async (id) => {
    try {
      await updateDoc(doc(db, "faculties", id), {
        deleteRequested: true,
        status: "pending",
      });
    } catch (err) {
      console.error("Error requesting delete:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-primary">
          Faculties Management
        </h1>

        <div className="space-y-4">
          <Input
            placeholder="Faculty Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Faculty Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleCreateOrUpdate} disabled={loading}>
            {loading
              ? "Submitting..."
              : editingId
              ? "Request Update"
              : "Request Creation"}
          </Button>
          {editingId && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setName("");
                setDescription("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {faculties.length > 0 ? (
          faculties.map((faculty) => (
            <Card
              key={faculty.id}
              className={`transition-all border ${
                faculty.status === "approved"
                  ? "border-primary"
                  : faculty.status === "pending"
                  ? "border-muted"
                  : "border-destructive"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{faculty.name}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      faculty.status === "approved"
                        ? "bg-primary/20 text-primary"
                        : faculty.status === "pending"
                        ? "bg-muted/20 text-muted-foreground"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {faculty.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {faculty.description || "No description provided."}
                </p>

                <div className="flex justify-between mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(faculty)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(faculty.id)}
                  >
                    Request Delete
                  </Button>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-semibold mb-2 text-primary">
                    Courses
                  </p>
                  {courses[faculty.id]?.length > 0 ? (
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      {courses[faculty.id].map((course) => (
                        <li key={course.id} className="flex justify-between">
                          <span>{course.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              course.status === "approved"
                                ? "bg-primary/20 text-primary"
                                : "bg-muted/20 text-muted-foreground"
                            }`}
                          >
                            {course.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No courses yet.
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() =>
                      alert("Navigate to Courses page for " + faculty.name)
                    }
                  >
                    Manage Courses →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center col-span-full">
            No faculties created yet.
          </p>
        )}
      </div>
    </div>
  );
}
