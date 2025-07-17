"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FiCalendar, FiHome, FiLogOut, FiUser, FiUsers } from "react-icons/fi";

interface User {
  email: string;
  user_type: "patient" | "doctor" | "admin";
}

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:8000/api/v1/users/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Auth error:", err);
          router.push("/auth/login");
        });
    } else {
      router.push("/auth/login");
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  if (loading) {
    return <div className="text-white px-6 py-6">Loading dashboard...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-4 fixed h-full z-10">
        <div className="text-2xl font-bold mb-8">🏥 Dashboard</div>

        <nav className="flex flex-col gap-2 mt-4 text-sm font-medium">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
          >
            <FiHome className="text-lg" />
            <span>Home</span>
          </a>

          <a
            href="/appointment"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
          >
            <FiCalendar className="text-lg" />
            <span>
              {user?.user_type === "patient"
                ? "My Appointments"
                : user?.user_type === "doctor"
                ? "Appointments"
                : "All Appointments"}
            </span>
          </a>

          {user?.user_type === "patient" && (
            <>
            
              <a
                href="/patient/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
              >
                <FiUser className="text-lg" />
                <span>My Profile</span>
              </a>
              <a
                href="/patient/appointments"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
              >
                <FiCalendar className="text-lg" />
                <span>Book Appointment</span>
              </a>
            </>
          )}

          {user?.user_type === "doctor" && (
            <>
              <a
                href="/doctor/schedule"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
              >
                <FiCalendar className="text-lg" />
                <span>My Schedule</span>
              </a>
              <a
                href="/doctor/patients"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
              >
                <FiUsers className="text-lg" />
                <span>My Patients</span>
              </a>
            </>
          )}

          {user?.user_type === "admin" && (
            <>
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"
              >
                <FiUsers className="text-lg" />
                <span>Manage Users</span>
              </a>
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4 fixed w-[calc(100%-16rem)] z-10">
          <h1 className="text-xl font-semibold">Welcome</h1>
          <div className="flex items-center gap-4">
            <FiUser className="text-2xl text-gray-600" />
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-20 px-6">{children}</main>
      </div>
    </div>
  );
}
