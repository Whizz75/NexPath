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
  ShieldCheck,
  CalendarCheck,
  BookOpen,
  FileText,
  BarChart3,
  GraduationCap,
  Building2,
  Clipboard,
  Bell,
  Briefcase,
  CheckSquare,
  ChartNoAxesColumnIncreasing,
  BookMarked,
  CircleUserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const roleLinks = {
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Overview", path: "/dashboard/admin/overview", icon: ChartNoAxesColumnIncreasing },
      { name: "Manage Institutions", path: "/dashboard/admin/institutions", icon: GraduationCap },
      { name: "Institute Courses", path: "/dashboard/admin/faculties", icon: BookOpen },
      { name: "Faculty Requests", path: "/dashboard/admin/faculty-requests", icon: BookMarked },
      { name: "Admissions", path: "/dashboard/admin/admissions", icon: FileText },
      { name: "Manage Companies", path: "/dashboard/admin/companies", icon: Building2 },
      { name: "Analytics", path: "/dashboard/admin/stats", icon: BarChart3 },
      { name: "Access Requests", path: "/dashboard/admin/access-requests", icon: ShieldCheck },
    ],
    
    institute: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Manage Faculties", path: "/dashboard/institute/faculties", icon: BookMarked },
      { name: "Manage Courses", path: "/dashboard/institute/courses", icon: BookOpen },
      { name: "Student Applications", path: "/dashboard/institute/applications", icon: FileText },
      { name: "Admissions", path: "/dashboard/institute/admissions", icon: CheckSquare },
      { name: "Profile", path: "/dashboard/institute/profile", icon: CircleUserRound },
    ],
    student: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Apply for Courses", path: "/dashboard/student/apply", icon: BookOpen },
      { name: "Admissions Results", path: "/dashboard/student/admissions", icon: GraduationCap },
      { name: "Profile & Documents", path: "/dashboard/student/profile", icon: CircleUserRound },
      { name: "Job Postings", path: "/dashboard/student/jobs", icon: Briefcase },
      { name: "Notifications", path: "/dashboard/student/notifications", icon: Bell },
    ],
    company: [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Post Jobs", path: "/dashboard/company/jobs", icon: Briefcase },
      { name: "View Applicants", path: "/dashboard/company/applicants", icon: Users },
      { name: "Interviews", path: "/dashboard/company/interviews", icon: CalendarCheck },
      { name: "Analytics", path: "/dashboard/company/analytics", icon: BarChart3 },
      { name: "Notifications", path: "/dashboard/company/notifications", icon: Bell },
      { name: "Profile", path: "/dashboard/company/profile", icon: CircleUserRound },
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
