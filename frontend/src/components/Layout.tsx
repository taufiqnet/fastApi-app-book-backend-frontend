"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FiCalendar, FiHome, FiLogOut, FiUser } from "react-icons/fi";

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
        
        <nav className="flex flex-col gap-2 mt-4 text-sm font-medium">

<nav className="flex flex-col gap-2 mt-4 text-sm font-medium">
<a href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"><FiHome className="text-lg" /><span>Home</span></a>
<a href="/patient/profile" className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"><FiUser className="text-lg" /><span>My Profile</span></a>
<a href="/patient/appointments" className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-800 transition"><FiCalendar className="text-lg" /><span>Book Appointment</span></a>
</nav>

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
