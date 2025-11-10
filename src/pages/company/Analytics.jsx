import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyAnalytics() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  const useCompanyData = (colName, setter) => {
    useEffect(() => {
      if (!user) return;
      const q = query(collection(db, colName), where("companyId", "==", user.uid));
      const unsub = onSnapshot(q, (snapshot) =>
        setter(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      );
      return () => unsub();
    }, [user]);
  };

  useCompanyData("jobs", setJobs);
  useCompanyData("jobApplications", setApplications);
  useCompanyData("interviews", setInterviews);

  const jobStatusData = useMemo(
    () => [
      { name: "Open", count: jobs.filter((j) => j.status === "Open").length },
      { name: "Closed", count: jobs.filter((j) => j.status === "Closed").length },
    ],
    [jobs]
  );

  const applicationStatusData = useMemo(
    () => [
      { name: "Pending", count: applications.filter((a) => a.status === "Pending").length },
      { name: "Accepted", count: applications.filter((a) => a.status === "Accepted").length },
      { name: "Rejected", count: applications.filter((a) => a.status === "Rejected").length },
    ],
    [applications]
  );

  const interviewStatusData = useMemo(
    () => [
      { name: "New", count: interviews.filter((i) => i.status === "Pending").length },
      { name: "Completed", count: interviews.filter((i) => i.status === "Completed").length },
      { name: "Cancelled", count: interviews.filter((i) => i.status === "Cancelled").length },
    ],
    [interviews]
  );

  const performanceData = [
    { label: "Applicants per Job", value: jobs.length ? (applications.length / jobs.length).toFixed(1) : 0 },
    { label: "Interviews per Applicant", value: applications.length ? (interviews.length / applications.length).toFixed(1) : 0 },
  ];

  const getWeeklyCounts = (items) => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayStr = day.toLocaleDateString("en-US", { weekday: "short" });
      const count = items.filter((item) => {
        const created = item.createdAt?.toDate?.() || new Date();
        return created.toDateString() === day.toDateString();
      }).length;
      return { day: dayStr, count };
    }).reverse();
    return last7Days;
  };

  const jobTrendData = getWeeklyCounts(jobs);
  const applicationTrendData = getWeeklyCounts(applications);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-teal-400 mb-6">Company Analytics Dashboard</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Card><CardContent><p className="text-sm text-gray-400">Jobs</p><h2 className="text-2xl font-bold">{jobs.length}</h2></CardContent></Card>
        <Card><CardContent><p className="text-sm text-gray-400">Applications</p><h2 className="text-2xl font-bold">{applications.length}</h2></CardContent></Card>
        <Card><CardContent><p className="text-sm text-gray-400">Interviews</p><h2 className="text-2xl font-bold">{interviews.length}</h2></CardContent></Card>
        <Card><CardContent><p className="text-sm text-gray-400">Active Jobs</p><h2 className="text-2xl font-bold">{jobStatusData[0].count}</h2></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Job Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={jobStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applications Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={applicationStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Interviews Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={interviewStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f472b6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* weekly trends */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Jobs Posted (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={jobTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applications Received (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={applicationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#facc15" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {performanceData.map((metric, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-400">{metric.label}</p>
              <h2 className="text-3xl font-semibold text-teal-400">{metric.value}</h2>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
