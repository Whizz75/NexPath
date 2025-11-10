import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

export default function FacultiesApproval() {
  const [groupedFaculties, setGroupedFaculties] = useState({});
  const [institutes, setInstitutes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "faculties"), async (snapshot) => {
      const faculties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const grouped = faculties.reduce((acc, f) => {
        if (!acc[f.instituteId]) acc[f.instituteId] = [];
        acc[f.instituteId].push(f);
        return acc;
      }, {});

      setGroupedFaculties(grouped);

      const instituteMap = {};
      for (const instituteId of Object.keys(grouped)) {
        if (!institutes[instituteId]) {
          const instDoc = await getDoc(doc(db, "institutes", instituteId));
          instituteMap[instituteId] = instDoc.exists()
            ? instDoc.data().name || "Unnamed Institute"
            : "Unknown Institute";
        }
      }

      setInstitutes((prev) => ({ ...prev, ...instituteMap }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (facultyId, status) => {
    await updateDoc(doc(db, "faculties", facultyId), { status });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Faculty Approval Panel</h1>
      <p className="text-muted-foreground mb-4">
        Review and manage faculty submissions grouped by institution.
      </p>

      {loading ? (
        <p className="text-muted-foreground">Loading faculties...</p>
      ) : Object.keys(groupedFaculties).length === 0 ? (
        <p className="text-muted-foreground">No faculty submissions found.</p>
      ) : (
        Object.entries(groupedFaculties).map(([instituteId, faculties]) => {
          const instituteName = institutes[instituteId] || "Loading...";
          const pending = faculties.filter((f) => f.status === "pending");
          const past = faculties.filter((f) => f.status !== "pending");

          return (
            <Card key={instituteId} className="bg-card text-card-foreground shadow-md border border-border">
              <CardHeader>
                <CardTitle className="text-lg flex justify-between">
                  <span>{instituteName}</span>
                  <span className="text-sm text-muted-foreground">
                    {faculties.length} total faculties
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-primary font-semibold mb-2">Pending Approvals</h3>
                  {pending.length > 0 ? (
                    <ul className="space-y-3">
                      {pending.map((f) => (
                        <li
                          key={f.id}
                          className="border border-border rounded-lg p-4 bg-muted/20 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-base">{f.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {f.description || "No description."}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {f.createdAt?.toDate?.().toLocaleString?.() || "N/A"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => updateStatus(f.id, "approved")}
                              className="text-green-500 border-green-500 hover:bg-green-500/10"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => updateStatus(f.id, "rejected")}
                              className="text-red-500 border-red-500 hover:bg-red-500/10"
                            >
                              Reject
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No pending requests.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-muted-foreground font-semibold mb-2">
                    Past Decisions
                  </h3>
                  {past.length > 0 ? (
                    <ul className="space-y-3">
                      {past.map((f) => (
                        <li
                          key={f.id}
                          className={`border rounded-lg p-4 flex justify-between items-center ${
                            f.status === "approved"
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-red-500/50 bg-red-500/10"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-base">{f.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {f.description || "No description."}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded ${
                              f.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {f.status.toUpperCase()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No past approvals or rejections yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
