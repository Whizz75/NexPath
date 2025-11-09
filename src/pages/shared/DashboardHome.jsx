import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  Settings,
  BookOpen,
  FileText,
  ClipboardList,
  Briefcase,
  CalendarCheck,
  BarChart3,
  Bell,
} from "lucide-react";

export default function DashboardHome() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-300">
        <p className="animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  // Role-based dashboard links (4 main pages per role)
  const getLinks = () => {
    switch (role) {
      case "admin":
        return [
          { label: "Access Requests", icon: ShieldCheck, path: "/dashboard/admin/access-requests" },
          { label: "Institutions", icon: Building2, path: "/dashboard/admin/institutions" },
          { label: "Companies", icon: Briefcase, path: "/dashboard/admin/companies" },
          { label: "Reports", icon: FileText, path: "/dashboard/admin/reports" },
        ];
      case "institute":
        return [
          { label: "Profile", icon: Building2, path: "/dashboard/institute/profile" },
          { label: "Faculties", icon: Users, path: "/dashboard/institute/faculties" },
          { label: "Courses", icon: BookOpen, path: "/dashboard/institute/courses" },
          { label: "Admissions", icon: ClipboardList, path: "/dashboard/institute/admissions" },
        ];
      case "student":
        return [
          { label: "Apply", icon: BookOpen, path: "/dashboard/student/apply" },
          { label: "Admissions", icon: GraduationCap, path: "/dashboard/student/admissions" },
          { label: "Jobs", icon: Briefcase, path: "/dashboard/student/jobs" },
          { label: "Notifications", icon: Bell, path: "/dashboard/student/notifications" },
        ];
      case "company":
        return [
          { label: "Job Posts", icon: Briefcase, path: "/dashboard/company/jobs" },
          { label: "Applicants", icon: Users, path: "/dashboard/company/applicants" },
          { label: "Matched Candidates", icon: FileText, path: "/dashboard/company/matches" },
          { label: "Interviews", icon: CalendarCheck, path: "/dashboard/company/interviews" },
        ];
      default:
        return [
          { label: "Get Started", icon: FileText, path: "/request-access" },
        ];
    }
  };

  const links = getLinks();

  return (
    <div className="relative h-screen w-full overflow-hidden text-slate-100">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/loop.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 to-slate-950/90 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4"
        >
          Welcome, {user?.name ?? user?.displayName ?? "User"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-slate-300 mb-10"
        >
          You’re logged in as <span className="font-semibold text-primary">{role?.toUpperCase() ?? "GUEST"}</span>
        </motion.p>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl"
        >
          {links.map((link, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(link.path)}
              className="cursor-pointer bg-slate-900/70 border border-slate-800 hover:border-primary/50 transition-all rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center"
            >
              <link.icon className="w-10 h-10 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-slate-100">{link.label}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
