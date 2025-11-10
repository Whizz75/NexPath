import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Apply() {
  const [institutes, setInstitutes] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [studentProfile, setStudentProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setUserId(user.uid);

      try {
        const profileRef = doc(db, "students", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) setStudentProfile(profileSnap.data());

        const appsQuery = query(collection(db, "applications"), where("studentId", "==", user.uid));
        const appsSnap = await getDocs(appsQuery);
        setApplications(appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const instSnap = await getDocs(collection(db, "institutes"));
        setInstitutes(instSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load application data.");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadFaculties = async (instId) => {
    setSelectedInstitute(instId);
    setSelectedFaculty("");
    setCourses([]);
    const facQuery = query(
      collection(db, "faculties"),
      where("instituteId", "==", instId),
      where("status", "==", "approved")
    );
    const facSnap = await getDocs(facQuery);
    setFaculties(facSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadCourses = async (facId) => {
    setSelectedFaculty(facId);
    const courseQuery = query(
      collection(db, "courses"),
      where("facultyId", "==", facId),
      where("status", "==", "approved")
    );
    const courseSnap = await getDocs(courseQuery);
    setCourses(courseSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const compareResults = (studentResults, minRequirements) => {
    const gradeRank = { A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

    for (let subject in minRequirements) {
      const studentGrade = studentResults?.[subject];
      const requiredGrade = minRequirements[subject];
      if (!studentGrade) return false;
      if (gradeRank[studentGrade] < gradeRank[requiredGrade]) return false;
    }
    return true;
  };

  const handleApply = async (course) => {
    if (!studentProfile) {
      toast.error("Please complete your profile before applying.");
      return;
    }

    const studentResults = studentProfile?.results;
    const minReqs = course.minRequirements;

    if (!compareResults(studentResults, minReqs)) {
      toast.error("You don't meet the minimum requirements for this course.");
      return;
    }

    const appliedInInstitute = applications.filter(
      (a) => a.instituteId === course.instituteId
    );
    if (appliedInInstitute.length >= 2) {
      toast.error("You can only apply to 2 courses per institution.");
      return;
    }

    if (applications.some((a) => a.courseId === course.id)) {
      toast.error("You have already applied for this course.");
      return;
    }

    await addDoc(collection(db, "applications"), {
      studentId: userId,
      courseId: course.id,
      facultyId: course.facultyId,
      instituteId: course.instituteId,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setApplications((prev) => [
      ...prev,
      { courseId: course.id, instituteId: course.instituteId },
    ]);
    toast.success(`Application submitted for ${course.name}!`);
  };

  const getButtonState = (course) => {
    if (!studentProfile)
      return { label: "Complete Profile First", variant: "muted", disabled: true };

    const studentResults = studentProfile?.results;
    const minReqs = course.minRequirements;

    const meetsReq = compareResults(studentResults, minReqs);
    const appliedToCourse = applications.some((a) => a.courseId === course.id);
    const appliedInInstitute = applications.filter(
      (a) => a.instituteId === course.instituteId
    );

    if (appliedToCourse)
      return { label: "Already Applied", variant: "secondary", disabled: true };

    if (appliedInInstitute.length >= 2)
      return { label: "Limit Reached", variant: "destructive", disabled: true };

    if (!meetsReq)
      return { label: "Does Not Qualify", variant: "muted", disabled: true };

    return { label: "Apply", variant: "default", disabled: false };
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-navy text-slate-300">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-navy text-slate-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Apply for Courses</h1>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <Select onValueChange={(v) => loadFaculties(v)}>
          <SelectTrigger className="bg-slate-800 border-slate-700 w-64">
            <SelectValue placeholder="Select Institute" />
          </SelectTrigger>
          <SelectContent>
            {institutes.map((inst) => (
              <SelectItem key={inst.id} value={inst.id}>
                {inst.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => loadCourses(v)} disabled={!faculties.length}>
          <SelectTrigger className="bg-slate-800 border-slate-700 w-64">
            <SelectValue placeholder="Select Faculty" />
          </SelectTrigger>
          <SelectContent>
            {faculties.map((fac) => (
              <SelectItem key={fac.id} value={fac.id}>
                {fac.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => {
            const btn = getButtonState(course);
            return (
              <Card
                key={course.id}
                className="bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all shadow-lg hover:shadow-2xl rounded-2xl"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-100">
                    {course.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">
                    {course.description || "No description provided."}
                  </p>

                  <div className="border border-slate-700 rounded-lg p-3 bg-slate-800/40">
                    <p className="font-semibold text-slate-200 mb-1">
                      Minimum Requirements:
                    </p>
                    {course.minRequirements ? (
                      <ul className="text-slate-400 text-sm">
                        {Object.entries(course.minRequirements).map(([subj, grade]) => (
                          <li key={subj}>
                            {subj}: {grade}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-slate-500 text-sm">
                        No requirements listed
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleApply(course)}
                    disabled={btn.disabled}
                    className={`w-full py-2 rounded-lg font-medium ${
                      btn.variant === "destructive"
                        ? "bg-red-700 hover:bg-red-800"
                        : btn.variant === "secondary"
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : btn.variant === "muted"
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {btn.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-center text-slate-400 italic">
            No courses available.
          </p>
        )}
      </div>
    </div>
  );
}
