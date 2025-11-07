import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function FacultiesApproval() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState({});

  const fetchFaculties = async () => {
    setLoading(true);
    const q = query(collection(db, "faculties"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setFaculties(data);
    setLoading(false);

    // Fetch related institutes
    const instituteData = {};
    for (const f of data) {
      if (!institutes[f.instituteId]) {
        const instDoc = await getDoc(doc(db, "institutes", f.instituteId));
        if (instDoc.exists()) {
          instituteData[f.instituteId] = instDoc.data().name || "Unnamed Institute";
        } else {
          instituteData[f.instituteId] = "Unknown";
        }
      }
    }
    setInstitutes((prev) => ({ ...prev, ...instituteData }));
  };

  const updateStatus = async (facultyId, status) => {
    await updateDoc(doc(db, "faculties", facultyId), { status });
    await fetchFaculties();
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Faculty Approval Panel</h1>

      {loading ? (
        <p>Loading pending faculties...</p>
      ) : faculties.length === 0 ? (
        <p className="text-gray-500">No pending faculties at the moment.</p>
      ) : (
        <ul className="space-y-3">
          {faculties.map((f) => (
            <li
              key={f.id}
              className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{f.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Institute:{" "}
                  <span className="font-medium">
                    {institutes[f.instituteId] || "Loading..."}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted: {f.createdAt?.toDate?.().toLocaleString?.() || "N/A"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateStatus(f.id, "approved")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStatus(f.id, "rejected")}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
