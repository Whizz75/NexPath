// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Auth Pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import RequestAccess from "@/pages/auth/RequestAccess";

// Shared Pages for Access Status
import PendingApproval from "@/pages/shared/PendingApproval";
import AccessDenied from "@/pages/shared/AccessDenied";

// Admin Module
import Institutions from "@/pages/admin/Institutions";
import FacultiesCourses from "@/pages/admin/FacultiesCourses";
import Admissions from "@/pages/admin/Admissions";
import Companies from "@/pages/admin/Companies";
import Reports from "@/pages/admin/Reports";
import AccessRequests from "@/pages/admin/AccessRequests";

// Institute Module
import Faculties from "@/pages/institute/Faculties";
import Courses from "@/pages/institute/Courses";
import Applications from "@/pages/institute/Applications";
import InstituteAdmissions from "@/pages/institute/Admissions";
import InstituteProfile from "@/pages/institute/Profile";

// Student Module
import Apply from "@/pages/student/Apply";
import StudentAdmissions from "@/pages/student/Admissions";
import Profile from "@/pages/student/Profile";
import Jobs from "@/pages/student/Jobs";
import Notifications from "@/pages/student/Notifications";

// Company Module
import JobPosts from "@/pages/company/Jobs";
import Applicants from "@/pages/company/Applicants";
import CompanyProfile from "@/pages/company/Profile";

// Shared Dashboard Home
import DashboardHome from "@/pages/shared/DashboardHome";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/sign-up" element={<Signup />} />
      <Route path="/auth/request-access" element={<RequestAccess />} />

      {/* Shared Access Status Pages */}
      <Route path="/access/pending" element={<PendingApproval />} />
      <Route path="/access/denied" element={<AccessDenied />} />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Shared Home (default landing for /dashboard) */}
        <Route index element={<DashboardHome />} />

        {/* Role-based landing routes */}
        <Route path="admin" element={<DashboardHome />} />
        <Route path="institute" element={<DashboardHome />} />
        <Route path="student" element={<DashboardHome />} />
        <Route path="company" element={<DashboardHome />} />

        {/* Admin Module */}
        <Route path="admin/institutions" element={<Institutions />} />
        <Route path="admin/faculties" element={<FacultiesCourses />} />
        <Route path="admin/admissions" element={<Admissions />} />
        <Route path="admin/companies" element={<Companies />} />
        <Route path="admin/reports" element={<Reports />} />
        <Route path="admin/access-requests" element={<AccessRequests />} />

        {/* Institute Module */}
        <Route path="institute/faculties" element={<Faculties />} />
        <Route path="institute/courses" element={<Courses />} />
        <Route path="institute/applications" element={<Applications />} />
        <Route path="institute/admissions" element={<InstituteAdmissions />} />
        <Route path="institute/profile" element={<InstituteProfile />} />

        {/* Student Module */}
        <Route path="student/apply" element={<Apply />} />
        <Route path="student/admissions" element={<StudentAdmissions />} />
        <Route path="student/profile" element={<Profile />} />
        <Route path="student/jobs" element={<Jobs />} />
        <Route path="student/notifications" element={<Notifications />} />

        {/* Company Module */}
        <Route path="company/jobs" element={<JobPosts />} />
        <Route path="company/applicants" element={<Applicants />} />
        <Route path="company/profile" element={<CompanyProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
