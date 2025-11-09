// src/pages/admin/AdminAnalytics.jsx
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [userGrowth, setUserGrowth] = useState([]);
  const [appTrends, setAppTrends] = useState([]);
  const [facultyCourseData, setFacultyCourseData] = useState([]);
  const [summary, setSummary] = useState({
    newUsers: 0,
    newApplications: 0,
    admittedRate: 0,
    totalFaculties: 0,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "asc")));
      const appsSnap = await getDocs(query(collection(db, "applications"), orderBy("createdAt", "asc")));
      const facultiesSnap = await getDocs(collection(db, "faculties"));
      const coursesSnap = await getDocs(collection(db, "courses"));

      const users = usersSnap.docs.map((d) => d.data());
      const apps = appsSnap.docs.map((d) => d.data());
      const faculties = facultiesSnap.docs.map((d) => d.data());
      const courses = coursesSnap.docs.map((d) => d.data());

      // --- User Growth (by date)
      const growthMap = {};
      users.forEach((u) => {
        if (u.createdAt) {
          const date = u.createdAt.toDate().toLocaleDateString();
          growthMap[date] = (growthMap[date] || 0) + 1;
        }
      });
      const growthData = Object.entries(growthMap).map(([date, count]) => ({
        date,
        count,
      }));

      // --- Application Trends
      const appTrendMap = {};
      apps.forEach((a) => {
        if (a.createdAt) {
          const date = a.createdAt.toDate().toLocaleDateString();
          if (!appTrendMap[date]) appTrendMap[date] = { date, admitted: 0, pending: 0, waitlisted: 0 };
          if (a.status === "admitted") appTrendMap[date].admitted++;
          else if (a.status === "pending") appTrendMap[date].pending++;
          else if (a.status === "waitlisted") appTrendMap[date].waitlisted++;
        }
      });
      const trendData = Object.values(appTrendMap);

      // --- Faculty-Course Data
      const facultyMap = {};
      courses.forEach((c) => {
        facultyMap[c.facultyId] = (facultyMap[c.facultyId] || 0) + 1;
      });
      const facultyCourse = faculties.map((f) => ({
        name: f.name,
        courses: facultyMap[f.instituteId] || 0,
      }));

      // --- Summary
      const admittedCount = apps.filter((a) => a.status === "admitted").length;
      const admittedRate = apps.length ? ((admittedCount / apps.length) * 100).toFixed(1) : 0;
      setSummary({
        newUsers: users.length,
        newApplications: apps.length,
        admittedRate,
        totalFaculties: faculties.length,
      });

      setUserGrowth(growthData);
      setAppTrends(trendData);
      setFacultyCourseData(facultyCourse);
    }

    fetchAnalytics();
  }, []);

  const COLORS = ["#3b82f6", "#06b6d4", "#a855f7", "#f59e0b"];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold">Analytics & Insights</h1>
          <p className="text-slate-400">Welcome back, {user?.name ?? "Admin"}</p>
        </div>
        <p className="text-slate-400">{new Date().toLocaleString()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "New Users", value: summary.newUsers },
          { label: "Applications", value: summary.newApplications },
          { label: "Admission Rate", value: `${summary.admittedRate}%` },
          { label: "Faculties", value: summary.totalFaculties },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md"
          >
            <p className="text-slate-400">{item.label}</p>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mt-2">
              {item.value}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* User Growth */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl font-semibold mb-4">User Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Application Trends */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl font-semibold mb-4">Application Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={appTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="admitted" stroke="#22c55e" strokeWidth={3} />
              <Line type="monotone" dataKey="pending" stroke="#eab308" strokeWidth={3} />
              <Line type="monotone" dataKey="waitlisted" stroke="#06b6d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Faculty-Course Breakdown */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-xl font-semibold mb-4">Courses per Faculty</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={facultyCourseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="courses" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
