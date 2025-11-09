// src/components/layout/DashboardLayout.jsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-gray-700 text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-navy text-slate-100 shadow-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4 border-slate-600" />

          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="text-slate-100 hover:text-teal-400">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-slate-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-200">
                  {user?.role?.toUpperCase() ?? "USER"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-4">
            <span className="font-medium text-slate-100 hidden sm:block">
              {user?.displayName ?? user?.name ?? "Guest"}
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-slate-600 px-3 py-1 text-sm hover:bg-teal-600 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6 md:p-10 bg-background overflow-y-auto min-h-[calc(100vh-4rem)] rounded-t-2xl shadow-inner">
          <Outlet />
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}
