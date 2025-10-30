import { Routes, Route, Link } from "react-router-dom";
import Institutions from "./Institutions";
import Companies from "./Companies";
import Users from "./Users";
import Reports from "./Reports";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="institutions" className="hover:text-blue-600">Institutions</Link>
          <Link to="companies" className="hover:text-blue-600">Companies</Link>
          <Link to="users" className="hover:text-blue-600">Users</Link>
          <Link to="reports" className="hover:text-blue-600">Reports</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div>Welcome Admin!</div>} />
          <Route path="institutions" element={<Institutions />} />
          <Route path="companies" element={<Companies />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}
