// src/pages/student/Profile.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [userType, setUserType] = useState("");
  const [saved, setSaved] = useState(false);
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
    uniCourse: "",
    uniInstitution: "",
    uniGPA: "",
  });
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  const gradeOptions = ["A", "B", "C", "D", "E", "F"];

  // Load existing profile
  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "students", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserType(data.userType || "");
          setFormData((prev) => ({
            ...prev,
            ...data,
            results: data.results || prev.results,
          }));
          setSaved(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResultChange = (subject, field, value) => {
    setFormData((prev) => ({
      ...prev,
      results: {
        ...prev.results,
        [subject]: {
          ...prev.results[subject],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return alert("User not logged in");

    try {
      await setDoc(doc(db, "students", uid), { ...formData, userType }, { merge: true });
      setSaved(true);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile 😭");
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
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+266 50000000"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="High School / University Name"
                        required
                      />
                    </div>
                  </div>

                  {/* Student Type */}
                  <div className="text-center mt-8">
                    <p className="font-semibold mb-2">Select Student Type</p>
                    <div className="flex justify-center gap-6">
                      <Button
                        type="button"
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                          userType === "highschool"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={() => setUserType("highschool")}
                      >
                        High School
                      </Button>
                      <Button
                        type="button"
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                          userType === "graduate"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={() => setUserType("graduate")}
                      >
                        Graduate
                      </Button>
                    </div>
                  </div>

                  {/* Conditional Sections */}
                  {userType === "highschool" && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4 text-center">High School Results</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(formData.results).map((subject) => (
                          <div key={subject} className="p-3 rounded-lg bg-muted/30 border">
                            <Label className="font-medium">{subject}</Label>
                            <div className="flex gap-3 mt-2">
                              <select
                                value={formData.results[subject].grade}
                                onChange={(e) =>
                                  handleResultChange(subject, "grade", e.target.value)
                                }
                                className="flex-1 bg-muted text-foreground rounded-lg p-2 focus:ring-2 focus:ring-primary"
                              >
                                <option value="">Grade</option>
                                {gradeOptions.map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </select>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Mark"
                                value={formData.results[subject].mark}
                                onChange={(e) =>
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
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4 text-center">University Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="uniCourse">Course Studied</Label>
                          <Input
                            name="uniCourse"
                            value={formData.uniCourse}
                            onChange={handleChange}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <Label htmlFor="uniInstitution">University</Label>
                          <Input
                            name="uniInstitution"
                            value={formData.uniInstitution}
                            onChange={handleChange}
                            placeholder="University of ..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="uniGPA">Final GPA / Grade</Label>
                          <Input
                            name="uniGPA"
                            value={formData.uniGPA}
                            onChange={handleChange}
                            placeholder="3.8 / 4.0 or First Class"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center mt-8">
                    <Button
                      type="submit"
                      className="px-10 py-3 bg-accent text-accent-foreground rounded-xl hover:opacity-90 hover:scale-105 transition-all"
                    >
                      Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          ) : (
            // Profile Summary Card
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
                      <p><strong>Course:</strong> {formData.uniCourse}</p>
                      <p><strong>University:</strong> {formData.uniInstitution}</p>
                      <p><strong>GPA:</strong> {formData.uniGPA}</p>
                    </>
                  )}
                </div>
              </div>

              {userType === "highschool" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(formData.results).map(([subject, { grade, mark }]) => (
                      <p key={subject}>
                        <strong>{subject}:</strong> {grade || "—"} ({mark || "—"}%)
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setSaved(false)}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl hover:opacity-90 hover:scale-105 transition-all"
              >
                Edit Profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
