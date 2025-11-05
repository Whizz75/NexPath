// src/components/layout/AppSidebar.jsx
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BookOpen,
  FileText,
  Clipboard,
  Briefcase,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const roleLinks = {
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Manage Institutions", path: "/dashboard/admin/institutions", icon: BookOpen },
      { name: "Faculties & Courses", path: "/dashboard/admin/faculties", icon: Clipboard },
      { name: "Admissions", path: "/dashboard/admin/admissions", icon: FileText },
      { name: "Manage Companies", path: "/dashboard/admin/companies", icon: Users },
      { name: "System Reports", path: "/dashboard/admin/reports", icon: FileText },
      { name: "Access Requests", path: "/dashboard/admin/access-requests", icon: FileText },
    ],
    
    institute: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Manage Faculties", path: "/dashboard/institute/faculties", icon: BookOpen },
      { name: "Manage Courses", path: "/dashboard/institute/courses", icon: Clipboard },
      { name: "Student Applications", path: "/dashboard/institute/applications", icon: FileText },
      { name: "Admissions", path: "/dashboard/institute/admissions", icon: CheckSquare },
      { name: "Profile", path: "/dashboard/institute/profile", icon: Users },
    ],
    student: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Apply for Courses", path: "/dashboard/student/apply", icon: BookOpen },
      { name: "Admissions Results", path: "/dashboard/student/admissions", icon: FileText },
      { name: "Profile & Documents", path: "/dashboard/student/profile", icon: Clipboard },
      { name: "Job Postings", path: "/dashboard/student/jobs", icon: Briefcase },
      { name: "Notifications", path: "/dashboard/student/notifications", icon: Users },
    ],
    company: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Post Jobs", path: "/dashboard/company/jobs", icon: Briefcase },
      { name: "View Applicants", path: "/dashboard/company/applicants", icon: Users },
      { name: "Profile", path: "/dashboard/company/profile", icon: Clipboard },
    ],
  };

  const links = roleLinks[user?.role?.toLowerCase?.()] ?? [];

  return (
    <Sidebar className="bg-navy text-slate-100 min-h-screen">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold tracking-wide text-slate-100 px-4 py-3 mb-2">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Portal Logo" className="h-8" />
              NexPath Portal
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ name, path, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                        isActive
                          ? "bg-teal-600 text-white shadow-sm"
                          : "hover:bg-slate-800 text-slate-100"
                      }`}
                    >
                      <Link to={path} className="flex items-center gap-2 w-full">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
