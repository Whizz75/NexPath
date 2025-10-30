// src/components/app-sidebar/index.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export const AppSidebar = ({ role, variant = "default" }) => {
  let menuItems = [];

  switch (role) {
    case "student":
      menuItems = [
        { label: "Dashboard", path: "/student/dashboard" },
        { label: "Profile", path: "/student/profile" },
        { label: "Learning Path", path: "/student/learning-path" },
      ];
      break;
    case "institute":
      menuItems = [
        { label: "Dashboard", path: "/institute/dashboard" },
        { label: "Students", path: "/institute/students" },
      ];
      break;
    case "admin":
      menuItems = [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Users", path: "/admin/users" },
        { label: "Analytics", path: "/admin/analytics" },
      ];
      break;
    case "company":
      menuItems = [
        { label: "Dashboard", path: "/company/dashboard" },
        { label: "Talent Pool", path: "/company/talent" },
      ];
      break;
    default:
      menuItems = [];
  }

  return (
    <aside
      className={`bg-gray-50 dark:bg-gray-900 p-4 ${
        variant === "inset" ? "shadow-lg rounded-r-lg" : ""
      }`}
    >
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${
                isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
