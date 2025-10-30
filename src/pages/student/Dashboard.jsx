// src/pages/student/Dashboard.jsx
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Student Dashboard</h2>
        <p>Track your learning, progress, and upcoming tasks.</p>
      </div>
    </DashboardLayout>
  );
}
