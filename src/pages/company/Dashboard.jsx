import { Routes, Route, Link } from "react-router-dom";
import JobPosts from "./JobPosts";
import Applicants from "./Applicants";
import Profile from "./Profile";

export default function CompanyDashboard() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Company Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="job-posts" className="hover:text-blue-600">Job Posts</Link>
          <Link to="applicants" className="hover:text-blue-600">Applicants</Link>
          <Link to="profile" className="hover:text-blue-600">Profile</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div>Welcome Company!</div>} />
          <Route path="job-posts" element={<JobPosts />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
