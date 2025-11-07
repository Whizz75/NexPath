import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Faculties() {
  const [faculties, setFaculties] = useState([]);
  const [facultyName, setFacultyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const [courses, setCourses] = useState({});
  const user = auth.currentUser;

  const fetchFaculties = async () => {
    if (!user) return;
    const q = query(collection(db, "faculties"), where("instituteId", "==", user.uid));
    const snapshot = await getDocs(q);
    setFaculties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchCourses = async (facultyId) => {
    const q = query(collection(db, "courses"), where("facultyId", "==", facultyId));
    const snapshot = await getDocs(q);
    setCourses((prev) => ({
      ...prev,
      [facultyId]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    }));
  };

  const addFaculty = async () => {
    if (!facultyName.trim() || !user) return;
    setLoading(true);
    await addDoc(collection(db, "faculties"), {
      name: facultyName,
      instituteId: user.uid,
      status: "pending", // 👈 requires admin approval
      createdAt: new Date(),
    });
    setFacultyName("");
    await fetchFaculties();
    setLoading(false);
  };

  const deleteFaculty = async (id) => {
    await deleteDoc(doc(db, "faculties", id));
    await fetchFaculties();
  };

  const toggleFaculty = async (facultyId) => {
    if (expandedFaculty === facultyId) {
      setExpandedFaculty(null);
    } else {
      setExpandedFaculty(facultyId);
      if (!courses[facultyId]) await fetchCourses(facultyId);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Faculties</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Enter faculty name"
          value={facultyName}
          onChange={(e) => setFacultyName(e.target.value)}
        />
        <Button onClick={addFaculty} disabled={loading}>
          {loading ? "Submitting..." : "Request Faculty"}
        </Button>
      </div>

      <ul className="space-y-3">
        {faculties.map((f) => (
          <li
            key={f.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{f.name}</h2>
                <p
                  className={`text-sm mt-1 ${
                    f.status === "approved"
                      ? "text-green-600"
                      : f.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  Status: {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => toggleFaculty(f.id)}
                  className="flex items-center gap-1"
                >
                  {expandedFaculty === f.id ? (
                    <>
                      Hide Courses <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      View Courses <ChevronDown size={16} />
                    </>
                  )}
                </Button>

                {f.status === "pending" ? (
                  <Button variant="destructive" disabled>
                    Awaiting Approval
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => deleteFaculty(f.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {expandedFaculty === f.id && (
              <div className="mt-4 border-t pt-3">
                <h3 className="text-sm font-medium mb-2">Courses:</h3>
                {courses[f.id]?.length ? (
                  <ul className="space-y-1">
                    {courses[f.id].map((c) => (
                      <li
                        key={c.id}
                        className="flex justify-between items-center border rounded-md p-2"
                      >
                        <span>{c.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.location.assign(`/institute/courses?id=${c.id}`)
                          }
                        >
                          Manage
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No courses found.</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
