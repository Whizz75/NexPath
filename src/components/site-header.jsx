import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function SiteHeader() {
  const { user, logout } = useAuth() || { user: null }

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
      <h2 className="text-slate-300 font-medium">Dashboard</h2>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-slate-400">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
