// src/pages/admin/Reports.jsx
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function Reports() {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [systemData, setSystemData] = useState({
    users: [],
    students: [],
    faculties: [],
    courses: [],
    applications: [],
    institutes: [],
    companies: [],
  });
  const [summary, setSummary] = useState({});
  const COLORS = ["#3b82f6", "#06b6d4", "#a855f7", "#f59e0b"];

  const collections = ["users","students","faculties","courses","applications","institutes","companies"];

  useEffect(() => {
    async function fetchSystemData() {
      const dataObj = {};
      for (const col of collections) {
        const snap = await getDocs(query(collection(db, col), orderBy("createdAt")));
        const filtered = snap.docs
          .map(d => d.data())
          .filter(item => item.createdAt?.toDate() >= startDate && item.createdAt?.toDate() <= endDate);
        dataObj[col] = filtered;
      }
      setSystemData(dataObj);

      const admitted = dataObj.applications.filter(a => a.status === "admitted").length;
      const pending = dataObj.applications.filter(a => a.status === "pending").length;
      const waitlisted = dataObj.applications.filter(a => a.status === "waitlisted").length;

      const roleCounts = dataObj.users.reduce((acc, u) => { acc[u.role] = (acc[u.role]||0)+1; return acc; }, {});

      setSummary({
        totalUsers: dataObj.users.length,
        roleDistribution: Object.entries(roleCounts).map(([name,value])=>({name,value})),
        totalStudents: dataObj.students.length,
        totalFaculties: dataObj.faculties.length,
        totalCourses: dataObj.courses.length,
        totalApplications: dataObj.applications.length,
        admittedApplications: admitted,
        pendingApplications: pending,
        waitlistedApplications: waitlisted,
        totalInstitutes: dataObj.institutes.length,
        totalCompanies: dataObj.companies.length,
      });
    }
    fetchSystemData();
  }, [startDate,endDate]);

  const exportExcel = (collectionName) => {
    const ws = XLSX.utils.json_to_sheet(systemData[collectionName]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, collectionName);
    XLSX.writeFile(wb, `${collectionName}_report_${Date.now()}.xlsx`);
  };

  const exportCSV = (collectionName) => {
    const csv = Papa.unparse(systemData[collectionName]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${collectionName}_report_${Date.now()}.csv`);
  };

  const exportPDF = (collectionName) => {
    const doc = new jsPDF();
    const data = systemData[collectionName];
    if(data.length===0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(key=>{
      const val=item[key];
      if(val && val.toDate) return val.toDate().toLocaleString();
      if(val && typeof val==='object') return Object.entries(val).map(([k,v])=>`${k}:${v.grade||v}`).join(", ");
      return val??"";
    }));
    doc.autoTable({head:[headers],body:rows});
    doc.save(`${collectionName}_report_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">
        <h1 className="text-3xl font-semibold mb-4 lg:mb-0">System Reports</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-start lg:items-center">
          <div className="flex gap-2">
            <label className="text-slate-400 self-center">Start Date:</label>
            <input type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={e=>setStartDate(new Date(e.target.value))}
              className="rounded p-1 bg-slate-800 text-slate-100 border border-slate-700"/>
          </div>
          <div className="flex gap-2">
            <label className="text-slate-400 self-center">End Date:</label>
            <input type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={e=>setEndDate(new Date(e.target.value))}
              className="rounded p-1 bg-slate-800 text-slate-100 border border-slate-700"/>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Object.entries(summary).filter(([k])=>!["roleDistribution"].includes(k)).map(([label,value],i)=>(
          <motion.div key={i} whileHover={{scale:1.03}}
            className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md">
            <p className="text-slate-400">{label.replace(/([A-Z])/g," $1")}</p>
            <h2 className="text-3xl font-bold mt-2">{value}</h2>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Role Distribution */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl mb-4 font-semibold">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={summary.roleDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                {summary.roleDistribution?.map((entry,index)=>(
                  <Cell key={index} fill={COLORS[index%COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip/>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>exportExcel("users")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Excel</button>
            <button onClick={()=>exportCSV("users")} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white">CSV</button>
            <button onClick={()=>exportPDF("users")} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white">PDF</button>
          </div>
        </div>

        {/* Applications Overview */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl mb-4 font-semibold">Applications Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              {name:"Admitted", value:summary.admittedApplications},
              {name:"Pending", value:summary.pendingApplications},
              {name:"Waitlisted", value:summary.waitlistedApplications},
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" stroke="#94a3b8"/>
              <YAxis stroke="#94a3b8"/>
              <Tooltip/>
              <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>exportExcel("applications")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Excel</button>
            <button onClick={()=>exportCSV("applications")} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white">CSV</button>
            <button onClick={()=>exportPDF("applications")} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white">PDF</button>
          </div>
        </div>
      </div>

      {/* Optional: Add more charts per collection (courses per faculty, students per institute, companies per status) */}
    </div>
  );
}
