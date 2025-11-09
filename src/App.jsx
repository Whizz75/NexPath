// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Auth Pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import RequestAccess from "@/pages/auth/RequestAccess";

// Shared Access Pages
import PendingApproval from "@/pages/shared/PendingApproval";
import AccessDenied from "@/pages/shared/AccessDenied";
import DashboardHome from "@/pages/shared/DashboardHome";

// Admin Module
import Institutions from "@/pages/admin/Institutions";
import AdminOverview from "@/pages/admin/AdminOverview";
import FacultiesCourses from "@/pages/admin/FacultiesCourses";
import FacultiesApproval from "@/pages/admin/FacultiesApproval";
import Admissions from "@/pages/admin/Admissions";
import Companies from "@/pages/admin/Companies";
import Reports from "@/pages/admin/Reports";
import AccessRequests from "@/pages/admin/AccessRequests";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

// Institute Module
import Faculties from "@/pages/institute/Faculties";
import Courses from "@/pages/institute/Courses";
import Applications from "@/pages/institute/Applications";
import InstituteAdmissions from "@/pages/institute/Admissions";
import InstituteProfile from "@/pages/institute/Profile";

// Student Module
import Apply from "@/pages/student/Apply";
import StudentAdmissions from "@/pages/student/Admissions";
import StudentProfile from "@/pages/student/Profile";
import Jobs from "@/pages/student/Jobs";
import Notifications from "@/pages/student/Notifications";

// Company Module
import JobPosts from "@/pages/company/Jobs";
import JobDetails from "@/pages/company/JobDetails";
import Applicants from "@/pages/company/Applicants";
import MatchedCandidates from "@/pages/company/MatchedCandidates";
import Interviews from "@/pages/company/Interviews";
import CompanyAnalytics from "@/pages/company/Analytics";
import CompanyNotifications from "@/pages/company/Notifications";
import CompanySettings from "@/pages/company/Settings";
import CompanyProfile from "@/pages/company/Profile";

function App() {
  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route path="/" element={<Login />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/sign-up" element={<Signup />} />
      <Route path="/auth/request-access" element={<RequestAccess />} />

      {/* ---------- Access Status ---------- */}
      <Route path="/access/pending" element={<PendingApproval />} />
      <Route path="/access/denied" element={<AccessDenied />} />

      {/* ---------- Protected Routes ---------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default landing */}
        <Route index element={<DashboardHome />} />

        {/* Role-based root landing */}
        <Route path="admin" element={<DashboardHome />} />
        <Route path="institute" element={<DashboardHome />} />
        <Route path="student" element={<DashboardHome />} />
        <Route path="company" element={<DashboardHome />} />

        {/* ---------- Admin Module ---------- */}
        <Route path="admin/overview" element={<AdminOverview />} />
        <Route path="admin/institutions" element={<Institutions />} />
        <Route path="admin/faculties" element={<FacultiesCourses />} />
        <Route path="admin/faculty-requests" element={<FacultiesApproval />} />
        <Route path="admin/admissions" element={<Admissions />} />
        <Route path="admin/companies" element={<Companies />} />
        <Route path="admin/reports" element={<Reports />} />
        <Route path="admin/stats" element={<AdminAnalytics />} />
        <Route path="admin/access-requests" element={<AccessRequests />} />

        {/* ---------- Institute Module ---------- */}
        <Route path="institute/faculties" element={<Faculties />} />
        <Route path="institute/courses" element={<Courses />} />
        <Route path="institute/applications" element={<Applications />} />
        <Route path="institute/admissions" element={<InstituteAdmissions />} />
        <Route path="institute/profile" element={<InstituteProfile />} />

        {/* ---------- Student Module ---------- */}
        <Route path="student/apply" element={<Apply />} />
        <Route path="student/admissions" element={<StudentAdmissions />} />
        <Route path="student/profile" element={<StudentProfile />} />
        <Route path="student/jobs" element={<Jobs />} />
        <Route path="student/notifications" element={<Notifications />} />

        {/* ---------- Company Module ---------- */}
        <Route path="company/jobs" element={<JobPosts />} />
        <Route path="company/jobs/:jobId" element={<JobDetails />} />
        <Route path="company/applicants" element={<Applicants />} />
        <Route path="company/matches" element={<MatchedCandidates />} />
        <Route path="company/interviews" element={<Interviews />} />
        <Route path="company/analytics" element={<CompanyAnalytics />} />
        <Route path="company/notifications" element={<CompanyNotifications />} />
        <Route path="company/profile" element={<CompanyProfile />} />
        <Route path="company/settings" element={<CompanySettings />} />
      </Route>
    </Routes>
  );
}

export default App;
