import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    minGPA: "",
    preferredCourse: "",
    industry: "",
    experience: "",
    certificates: "",
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const q = query(collection(db, "courses"));
      const snapshot = await getDocs(q);
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      const q = query(
        collection(db, "jobs"),
        where("companyId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const jobsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const job = { id: doc.id, ...doc.data() };

          const applQuery = query(
            collection(db, "jobApplications"),
            where("jobId", "==", job.id)
          );
          const applSnapshot = await getDocs(applQuery);
          return { ...job, applicants: applSnapshot.size };
        })
      );

      setJobs(jobsData);
    };
    fetchJobs();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.salary || !form.industry)
      return alert("Please fill all required fields.");

    try {
      if (editingJobId) {
        await updateDoc(doc(db, "jobs", editingJobId), form);
        alert("Job updated successfully!");
        setEditingJobId(null);
      } else {
        await addDoc(collection(db, "jobs"), {
          ...form,
          companyId: user.uid,
          companyName: user.displayName || user.email,
          createdAt: Timestamp.now(),
          views: 0,
          status: "Open",
        });
        alert("Job posted successfully!");
      }

      setForm({
        title: "",
        description: "",
        salary: "",
        minGPA: "",
        preferredCourse: "",
        industry: "",
        experience: "",
        certificates: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit job.");
    }
  };

  const handleEdit = (job) => {
    setForm({
      title: job.title,
      description: job.description,
      salary: job.salary,
      minGPA: job.minGPA,
      preferredCourse: job.preferredCourse,
      industry: job.industry,
      experience: job.experience,
      certificates: job.certificates,
    });
    setEditingJobId(job.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs((prev) => prev.filter((j) => j.id !== id));
      alert("Job deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    }
  };

  return (
    <div className="p-6 space-y-12">
      <Card className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 shadow-lg max-w-3xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-teal-400">
            {editingJobId ? "Edit Job" : "Post a New Job"}
          </h2>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="col-span-2">
              <Label>Title</Label>
              <Input
                placeholder="DevOps Engineer"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the role"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Salary</Label>
              <Input
                placeholder="100000"
                name="salary"
                value={form.salary}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Minimum GPA</Label>
              <Input
                placeholder="3.0"
                name="minGPA"
                value={form.minGPA}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Preferred Course</Label>
              <Select
                value={form.preferredCourse}
                onValueChange={(val) =>
                  setForm({ ...form, preferredCourse: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Industry</Label>
              <Input
                placeholder="Tech"
                name="industry"
                value={form.industry}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Experience</Label>
              <Input
                placeholder="1 year"
                name="experience"
                value={form.experience}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2">
              <Label>Certificates</Label>
              <Input
                placeholder="AWS, CI/CD"
                name="certificates"
                value={form.certificates}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2 flex justify-end">
              <Button type="submit">
                {editingJobId ? "Update Job" : "Post Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Your Job Listings
        </h2>
        {jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const certificatesArray = Array.isArray(job.certificates)
                ? job.certificates
                : job.certificates
                ? job.certificates.toString().split(",").map((c) => c.trim())
                : [];

              return (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                  <Card className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 hover:border-teal-500 shadow-lg transition">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-teal-400">
                          {job.title}
                        </h3>
                        <span className="text-xs text-slate-400 uppercase">
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-3">
                        {job.description || "No description provided."}
                      </p>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>
                          <strong>Industry:</strong> {job.industry || "N/A"}
                        </p>
                        <p>
                          <strong>Min GPA:</strong> {job.minGPA || "N/A"}
                        </p>
                        <p>
                          <strong>Salary:</strong> M{job.salary}
                        </p>
                        <p>
                          <strong>Preferred Course:</strong>{" "}
                          {job.preferredCourse || "Any"}
                        </p>
                        {certificatesArray.length > 0 && (
                          <p>
                            <strong>Certificates:</strong>{" "}
                            {certificatesArray.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-700 mt-3">
                        <span>{job.views} views</span>
                        <span>{job.applicants} applicants</span>
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button size="sm" onClick={() => handleEdit(job)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(job.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center">No job posts yet.</p>
        )}
      </motion.section>
    </div>
  );
}
