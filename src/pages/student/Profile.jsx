import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [userType, setUserType] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const uid = auth.currentUser?.uid;

  const gradeOptions = ["A", "B", "C", "D", "E", "F"];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    institution: "",
    results: {
      PhysicalScience: { grade: "", mark: "" },
      Maths: { grade: "", mark: "" },
      English: { grade: "", mark: "" },
      Sesotho: { grade: "", mark: "" },
      Biology: { grade: "", mark: "" },
    },
    uniInstitution: "",
    uniCourse: "",
    uniGPA: "",
    qualifications: [],
    skills: [],
    experience: "",
    resumeURL: "",
  });

  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "students", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserType(data.userType || "");
          setFormData(prev => ({
            ...prev,
            ...data,
            results: data.results || prev.results,
            skills: data.skills || [],
            qualifications: data.qualifications || [],
          }));
          setSaved(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  useEffect(() => {
    if (!userType) return;

    const fetchInstitutions = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "institutes"), where("status", "==", "approved"))
        );
        const instData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setInstitutions(instData);
      } catch (err) {
        console.error("Error fetching institutions:", err);
      }
    };

    fetchInstitutions();
  }, [userType]);

  useEffect(() => {
    if (!formData.uniInstitution) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      try {
        const selectedInstitute = institutions.find(inst => inst.name === formData.uniInstitution);
        if (!selectedInstitute) return;

        const snap = await getDocs(
          query(collection(db, "courses"), where("instituteId", "==", selectedInstitute.id), where("status", "==", "approved"))
        );
        const courseNames = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(courseNames);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [formData.uniInstitution, institutions]);
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResultChange = (subject, field, value) => {
    setFormData(prev => ({
      ...prev,
      results: { ...prev.results, [subject]: { ...prev.results[subject], [field]: value } },
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill("");
  };

  const removeSkill = skill => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!uid) return alert("User not logged in");

    try {
      await setDoc(doc(db, "students", uid), { ...formData, userType }, { merge: true });
      setSaved(true);
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    }
  };

  if (loading) return <p className="text-center mt-20 text-foreground">Loading profile...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-6 py-12">
      <Card className="w-full max-w-3xl bg-card text-card-foreground shadow-2xl rounded-2xl p-8">
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <CardHeader className="text-center mb-6">
                <CardTitle className="text-3xl font-bold">Student Profile Setup</CardTitle>
                <p className="text-muted-foreground mt-2">Fill in your details below</p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Full Name</Label>
                      <Input name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <p className="font-semibold mb-2">Select Student Type</p>
                    <div className="flex justify-center gap-6">
                      <Button
                        type="button"
                        className={userType === "highschool" ? "bg-primary" : "bg-muted"}
                        onClick={() => setUserType("highschool")}
                      >
                        High School
                      </Button>
                      <Button
                        type="button"
                        className={userType === "graduate" ? "bg-primary" : "bg-muted"}
                        onClick={() => setUserType("graduate")}
                      >
                        Graduate
                      </Button>
                    </div>
                  </div>

                  {userType === "highschool" && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4 text-center">High School Results</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(formData.results).map(subject => (
                          <div key={subject} className="p-3 rounded-lg bg-muted/30 border">
                            <Label className="font-medium">{subject}</Label>
                            <div className="flex gap-3 mt-2">
                              <select
                                value={formData.results[subject].grade}
                                onChange={e =>
                                  handleResultChange(subject, "grade", e.target.value)
                                }
                                className="flex-1 bg-muted rounded-lg p-2"
                              >
                                <option value="">Grade</option>
                                {gradeOptions.map(grade => (
                                  <option key={grade}>{grade}</option>
                                ))}
                              </select>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Mark"
                                value={formData.results[subject].mark}
                                onChange={e =>
                                  handleResultChange(subject, "mark", e.target.value)
                                }
                                className="w-24 text-center"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userType === "graduate" && (
                    <>
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center">University Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>University</Label>
                            <select
                              value={formData.uniInstitution}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  uniInstitution: e.target.value,
                                  uniCourse: "",
                                })
                              }
                              className="w-full rounded-lg p-2 bg-muted"
                            >
                              <option value="">Select University</option>
                              {institutions.map(inst => (
                                <option key={inst.id}>{inst.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Course Studied</Label>
                            <select
                              value={formData.uniCourse}
                              onChange={e =>
                                setFormData({ ...formData, uniCourse: e.target.value })
                              }
                              className="w-full rounded-lg p-2 bg-muted"
                            >
                              <option value="">Select Course</option>
                              {courses.map(course => (
                                <option key={course.id}>{course.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Final GPA / Grade</Label>
                            <Input
                              name="uniGPA"
                              value={formData.uniGPA}
                              onChange={handleChange}
                              placeholder="3.8 / 4.0 or First Class"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-10">
                        <h2 className="text-xl font-semibold mb-4 text-center">
                          Professional Qualifications & Skills
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <Label>Professional Qualifications</Label>
                            <Input
                              placeholder="e.g., AWS, CCNA..."
                              value={formData.qualifications.join(", ")}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  qualifications: e.target.value
                                    .split(",")
                                    .map(q => q.trim()),
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Skills</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={newSkill}
                                onChange={e => setNewSkill(e.target.value)}
                                placeholder="Add a skill"
                              />
                              <Button type="button" onClick={addSkill}>
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {formData.skills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="bg-primary/20 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label>Experience Summary</Label>
                            <textarea
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              placeholder="Briefly describe your work experience or projects"
                              className="w-full rounded-lg p-2 bg-muted min-h-[100px]"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="text-center mt-8">
                    <Button
                      type="submit"
                      className="px-10 py-3 bg-accent text-accent-foreground rounded-xl"
                    >
                      Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-6 text-primary">Profile Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                <div>
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Institution:</strong> {formData.institution}</p>
                </div>
                <div>
                  <p><strong>Type:</strong> {userType}</p>
                  {userType === "graduate" && (
                    <>
                      <p><strong>University:</strong> {formData.uniInstitution}</p>
                      <p><strong>Course:</strong> {formData.uniCourse}</p>
                      <p><strong>GPA:</strong> {formData.uniGPA}</p>
                      {formData.qualifications.length > 0 && (
                        <p><strong>Certifications:</strong> {formData.qualifications.join(", ")}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {userType === "graduate" && formData.skills.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {formData.skills.map((skill, i) => (
                      <span key={i} className="bg-primary/20 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-6">{formData.experience}</p>
                </>
              )}

              {userType === "highschool" && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(formData.results).map(([subject, { grade, mark }]) => (
                      <p key={subject}>
                        <strong>{subject}:</strong> {grade || "—"} ({mark || "—"}%)
                      </p>
                    ))}
                  </div>
                </>
              )}

              <Button onClick={() => setSaved(false)} className="bg-primary mt-8 px-8 py-3 rounded-xl">
                Edit Profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
