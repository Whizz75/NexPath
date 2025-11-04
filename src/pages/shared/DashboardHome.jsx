// src/pages/shared/DashboardHome.jsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHome() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome, {user?.name ?? "User"}!
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Your role: <span className="font-semibold">{role?.toUpperCase() ?? "GUEST"}</span>
      </p>
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Dashboard
        </h2>
        <p className="text-gray-500">
          This page is under construction. Please check back later for your module features.
        </p>
      </div>
    </div>
  );
}
