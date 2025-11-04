import { Home, BookOpen, Briefcase, Building2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import clsx from "clsx"

export function AppSidebar({ variant = "inset" }) {
  const { isOpen, setIsOpen } = useSidebar()

  // temporary: fake role
  const role = "student"

  const navItems = {
    student: [
      { label: "Home", icon: <Home size={18} />, href: "/dashboard/student" },
      { label: "My Applications", icon: <BookOpen size={18} />, href: "#" },
      { label: "Job Board", icon: <Briefcase size={18} />, href: "#" },
      { label: "Profile", icon: <Settings size={18} />, href: "#" },
    ],
    institution: [
      { label: "Dashboard", icon: <Home size={18} />, href: "#" },
      { label: "Manage Courses", icon: <BookOpen size={18} />, href: "#" },
      { label: "Admissions", icon: <Briefcase size={18} />, href: "#" },
    ],
    company: [
      { label: "Dashboard", icon: <Home size={18} />, href: "#" },
      { label: "Post Jobs", icon: <Briefcase size={18} />, href: "#" },
      { label: "Applicants", icon: <BookOpen size={18} />, href: "#" },
    ],
    admin: [
      { label: "Institutions", icon: <Building2 size={18} />, href: "#" },
      { label: "Companies", icon: <Briefcase size={18} />, href: "#" },
      { label: "Reports", icon: <BookOpen size={18} />, href: "#" },
      { label: "Settings", icon: <Settings size={18} />, href: "#" },
    ],
  }

  const items = navItems[role]

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-teal-500 rounded-full" />
            {isOpen && <h1 className="text-lg font-semibold">NexPath</h1>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "«" : "»"}
          </Button>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          {items.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-teal-400"
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && item.label}
            </Button>
          ))}
        </nav>
      </div>

      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
        {isOpen && "© NexPath 2025"}
      </div>
    </aside>
  )
}
