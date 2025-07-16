"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-4 fixed h-full z-10">
        <div className="text-2xl font-bold mb-8">🏥 Dashboard</div>
        <nav className="space-y-4">
          <a href="/" className="hover:text-blue-300">Home</a>
          <a href="/doctor/profile" className="hover:text-blue-300">My Profile</a>
          <a href="#" className="hover:text-blue-300">Appointments</a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4 fixed w-[calc(100%-16rem)] z-10">
          <h1 className="text-xl font-semibold">Welcome</h1>
          <div className="flex items-center gap-4">
            <FiUser className="text-2xl text-gray-600" />
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
        <main className="pt-20 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
