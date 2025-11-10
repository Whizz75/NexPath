import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminOverview() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    users: 0,
    students: 0,
    faculties: 0,
    courses: 0,
    applications: { admitted: 0, pending: 0, waitlisted: 0 },
  });
  const [roleData, setRoleData] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((d) => d.data());
      const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});
      setRoleData(
        Object.entries(roleCounts).map(([role, value]) => ({
          name: role,
          value,
        }))
      );
      setMetrics((prev) => ({
        ...prev,
        users: users.length,
        students: roleCounts["student"] || 0,
      }));
    });

    const unsubFaculties = onSnapshot(collection(db, "faculties"), (snapshot) => {
      setMetrics((prev) => ({ ...prev, faculties: snapshot.size }));
    });

    const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
      setMetrics((prev) => ({ ...prev, courses: snapshot.size }));
    });

    const unsubApplications = onSnapshot(
      query(collection(db, "applications"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const apps = snapshot.docs.map((d) => d.data());
        const counts = apps.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {});
        setMetrics((prev) => ({
          ...prev,
          applications: {
            admitted: counts["admitted"] || 0,
            pending: counts["pending"] || 0,
            waitlisted: counts["waitlisted"] || 0,
          },
        }));

        setRecentApps(apps.slice(0, 5));

        const byDay = {};
        apps.forEach((a) => {
          if (a.createdAt?.toDate) {
            const dateStr = a.createdAt.toDate().toLocaleDateString();
            byDay[dateStr] = (byDay[dateStr] || 0) + 1;
          }
        });
        const sorted = Object.entries(byDay).map(([day, count]) => ({
          date: day,
          count,
        }));
        setTrendData(sorted);
      }
    );

    return () => {
      unsubUsers();
      unsubFaculties();
      unsubCourses();
      unsubApplications();
    };
  }, []);

  const COLORS = ["#3b82f6", "#06b6d4", "#a855f7", "#f59e0b"];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">
            Welcome back, {user?.name ?? user?.displayName ?? "Admin"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleString()}
          </p>
        </div>
        <span className="px-4 py-1 bg-green-900/40 text-green-300 rounded-full text-sm">
          System Operational
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Users", value: metrics.users },
          { label: "Students", value: metrics.students },
          { label: "Faculties", value: metrics.faculties },
          { label: "Courses", value: metrics.courses },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-slate-900 rounded-2xl p-5 shadow-md border border-slate-800 hover:border-blue-500/40 transition"
            whileHover={{ scale: 1.03 }}
          >
            <p className="text-slate-400">{item.label}</p>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mt-2">
              {item.value}
            </h2>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl mb-4 font-semibold">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {roleData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl mb-4 font-semibold">Applications Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Admitted", value: metrics.applications.admitted },
                { name: "Pending", value: metrics.applications.pending },
                { name: "Waitlisted", value: metrics.applications.waitlisted },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-10">
        <h3 className="text-xl mb-4 font-semibold">Application Trends (7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-xl mb-4 font-semibold">Recent Applications</h3>
        <ul className="space-y-3">
          {recentApps.length > 0 ? (
            recentApps.map((app, i) => (
              <li
                key={i}
                className="text-slate-300 text-sm border-b border-slate-800 pb-2"
              >
                Student ID:{" "}
                <span className="font-mono">{app.studentId}</span> –{" "}
                <span
                  className={`capitalize ${
                    app.status === "admitted"
                      ? "text-green-400"
                      : app.status === "pending"
                      ? "text-yellow-400"
                      : "text-cyan-400"
                  }`}
                >
                  {app.status}
                </span>
                <br />
                <span className="text-slate-500 text-xs">
                  {app.createdAt?.toDate?.().toLocaleString()}
                </span>
              </li>
            ))
          ) : (
            <p className="text-slate-500">No recent applications yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
