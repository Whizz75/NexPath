import { Routes, Route, Link } from "react-router-dom";
import Faculties from "./Faculties";
import Courses from "./Courses";
import Applications from "./Applications";
import Admissions from "./Admissions";
import Profile from "./Profile";

export default function InstituteDashboard() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Institute Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="faculties" className="hover:text-blue-600">Faculties</Link>
          <Link to="courses" className="hover:text-blue-600">Courses</Link>
          <Link to="applications" className="hover:text-blue-600">Applications</Link>
          <Link to="admissions" className="hover:text-blue-600">Admissions</Link>
          <Link to="profile" className="hover:text-blue-600">Profile</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div>Welcome Institute!</div>} />
          <Route path="faculties" element={<Faculties />} />
          <Route path="courses" element={<Courses />} />
          <Route path="applications" element={<Applications />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
