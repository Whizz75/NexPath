// src/pages/admin/AdminOverview.jsx
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminOverview() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    students: 0,
    faculty: 0,
    admissions: { pending: 0, admitted: 0, waitlisted: 0 },
  });

  const [roleData, setRoleData] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const usersSnap = await getDocs(collection(db, "users"));
      const admissionsSnap = await getDocs(collection(db, "admissions"));

      const users = usersSnap.docs.map(doc => doc.data());
      const admissions = admissionsSnap.docs.map(doc => doc.data());

      const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});

      const admissionsCounts = admissions.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      setMetrics({
        totalUsers: users.length,
        students: roleCounts["student"] || 0,
        faculty: roleCounts["faculty"] || 0,
        admissions: {
          pending: admissionsCounts["pending"] || 0,
          admitted: admissionsCounts["admitted"] || 0,
          waitlisted: admissionsCounts["waitlisted"] || 0,
        },
      });

      setRoleData(Object.entries(roleCounts).map(([role, count]) => ({ name: role, value: count })));
    }

    fetchData();
  }, []);

  const COLORS = ["#3b82f6", "#06b6d4", "#a855f7", "#f59e0b"];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Welcome back, {user?.name ?? user?.displayName ?? "Admin"}</h1>
        <p className="text-slate-400">{new Date().toLocaleString()}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Users", value: metrics.totalUsers },
          { label: "Students", value: metrics.students },
          { label: "Faculty", value: metrics.faculty },
          { label: "Pending Admissions", value: metrics.admissions.pending },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-slate-900 rounded-2xl p-5 shadow-md border border-slate-800"
            whileHover={{ scale: 1.03 }}
          >
            <p className="text-slate-400">{item.label}</p>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mt-2">
              {item.value}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Role Distribution Pie Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl mb-4 font-semibold">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

        {/* Admissions Status Bar Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl mb-4 font-semibold">Admissions Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: "Admitted", value: metrics.admissions.admitted },
              { name: "Waitlisted", value: metrics.admissions.waitlisted },
              { name: "Pending", value: metrics.admissions.pending },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-xl mb-4 font-semibold">Recent Activity</h3>
        <ul className="space-y-2">
          {activity.length > 0 ? (
            activity.map((act, i) => (
              <li key={i} className="text-slate-300 text-sm border-b border-slate-800 pb-2">
                {act.description}
              </li>
            ))
          ) : (
            <p className="text-slate-500">No recent activity.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
