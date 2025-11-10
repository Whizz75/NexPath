import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

export default function Admissions() {
  const [institutions, setInstitutions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const instSnap = await getDocs(collection(db, "institutes"));
        const insts = instSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setInstitutions(insts);

        if (!insts.length) {
          setLoading(false);
          return;
        }

        const facultiesSnap = await getDocs(collection(db, "faculties"));
        const faculties = facultiesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const coursesSnap = await getDocs(collection(db, "courses"));
        const courses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const appsSnap = await getDocs(collection(db, "applications"));
        const apps = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const instData = insts.map((inst) => {
          const instFacs = faculties.filter((f) => f.instituteId === inst.id);
          const facultyMap = {};
          instFacs.forEach((f) => (facultyMap[f.id] = f.name || "Unknown Faculty"));

          const grouped = {};
          let totalAdmitted = 0,
            totalWaitlisted = 0;

          apps.forEach((app) => {
            const course = courses.find((c) => c.id === app.courseId);
            if (!course || course.instituteId !== inst.id) return;

            const facultyName = facultyMap[course.facultyId] || "Unknown Faculty";
            if (!grouped[facultyName]) grouped[facultyName] = { admitted: 0, waitlisted: 0, students: [] };

            if (app.status === "admitted") {
              grouped[facultyName].admitted += 1;
              totalAdmitted += 1;
            } else if (app.status === "waitlisted") {
              grouped[facultyName].waitlisted += 1;
              totalWaitlisted += 1;
            }

            grouped[facultyName].students.push(app);
          });

          const chartData = Object.entries(grouped).map(([faculty, counts]) => ({
            faculty,
            admitted: counts.admitted,
            waitlisted: counts.waitlisted,
          }));

          return {
            ...inst,
            chartData,
            totals: { totalApps: apps.filter((a) => a.instituteId === inst.id).length, admitted: totalAdmitted, waitlisted: totalWaitlisted },
            grouped,
          };
        });

        setData(instData);
      } catch (error) {
        console.error("Error fetching admissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentInstitution = data[currentIndex];

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading admissions data...
      </div>
    );

  if (!data.length)
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <h2 className="text-xl font-semibold">No admissions data available</h2>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Admissions Dashboard</h1>

      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <h2 className="text-xl font-semibold">{currentInstitution?.name}</h2>
        <Button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, data.length - 1))}
          disabled={currentIndex === data.length - 1}
        >
          Next
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 text-slate-100 shadow rounded-xl p-6 text-center">
          <p className="text-slate-400">Total Applications</p>
          <p className="text-2xl font-bold">{currentInstitution?.totals.totalApps}</p>
        </div>
        <div className="bg-emerald-600/80 text-white shadow-lg rounded-xl p-6 text-center">
          <p className="font-semibold tracking-wide">Admitted Students</p>
          <p className="text-2xl font-bold">{currentInstitution?.totals.admitted}</p>
        </div>
        <div className="bg-amber-500/80 text-white shadow-lg rounded-xl p-6 text-center">
          <p className="font-semibold tracking-wide">Waitlisted Students</p>
          <p className="text-2xl font-bold">{currentInstitution?.totals.waitlisted}</p>
        </div>
      </div>

      <div className="bg-slate-800 text-slate-100 shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Applications by Faculty</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={currentInstitution?.chartData || []}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="faculty" stroke="#cbd5e1" />
            <YAxis allowDecimals={false} stroke="#cbd5e1" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#f8fafc" }}
            />
            <Legend />
            <Bar dataKey="admitted" fill="#10b981" />
            <Bar dataKey="waitlisted" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentInstitution?.chartData.map((f) => (
          <div key={f.faculty} className="bg-slate-800 text-slate-100 shadow rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-2">{f.faculty}</h3>
            <p className="text-emerald-400 font-medium">
              Admitted: <span className="font-bold">{f.admitted}</span>
            </p>
            <p className="text-amber-400 font-medium">
              Waitlisted: <span className="font-bold">{f.waitlisted}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
