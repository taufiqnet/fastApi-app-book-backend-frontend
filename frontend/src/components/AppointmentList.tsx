"use client";

import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Notification from "./Notification";

interface Appointment {
  id: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  notes: string;
  appointment_time: string;
  patient: { full_name: string; id: number };
  doctor: { full_name: string; id: number };
}

interface User {
  email: string;
  user_type: "patient" | "doctor" | "admin";
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [doctorSearch, setDoctorSearch] = useState<string>(""); // For patients searching doctors
  const [patientSearch, setPatientSearch] = useState<string>(""); // For doctors searching patients

  // Pagination
  const rowsPerPage = 8;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const userRes = await axios.get("http://localhost:8000/api/v1/users/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      
      // Add name search parameters based on user type
      if (userRes.data.user_type === "patient" && doctorSearch) {
        params.append("doctor_name", doctorSearch);
      }
      if (userRes.data.user_type === "doctor" && patientSearch) {
        params.append("patient_name", patientSearch);
      }

      const apptRes = await axios.get(`http://localhost:8000/api/v1/appointment/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAppointments(apptRes.data);
      setCurrentPage(1); // Reset to page 1 after fetch
    } catch (err) {
      console.error("Error loading appointments", err);
      setNotification({ message: "Error loading appointments.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  // ... (keep your existing updateStatus function)

  const handleFilter = () => {
    fetchAppointments();
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setDoctorSearch("");
    setPatientSearch("");
    fetchAppointments();
  };

  // Pagination logic
  const totalPages = Math.ceil(appointments.length / rowsPerPage);
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Layout>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <h2 className="text-2xl font-bold mb-4">Appointments</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Doctor Search (for patients) */}
        {user?.user_type === "patient" && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Search Doctor</label>
            <input
              type="text"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder="Enter doctor name"
              className="border p-2 rounded"
            />
          </div>
        )}

        {/* Patient Search (for doctors) */}
        {user?.user_type === "doctor" && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Search Patient</label>
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Enter patient name"
              className="border p-2 rounded"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleFilter}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-fit"
          >
            Filter
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 h-fit"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <>
          <table className="w-full border">
            <thead className="bg-blue-100 text-left">
              <tr>
                <th className="p-2 border">#</th>
                {user?.user_type !== "patient" && <th className="p-2 border">Patient</th>}
                {user?.user_type !== "doctor" && <th className="p-2 border">Doctor</th>}
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Notes</th>
                <th className="p-2 border">Status</th>
                {user?.user_type === "doctor" && <th className="p-2 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((appt, idx) => (
                <tr key={appt.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                  {user?.user_type !== "doctor" && (
                    <td className="p-2 border">{appt.patient?.full_name || "N/A"}</td>
                  )}
                  {user?.user_type !== "patient" && (
                    <td className="p-2 border">{appt.doctor?.full_name || "N/A"}</td>
                  )}
                  <td className="p-2 border">{new Date(appt.appointment_time).toLocaleString()}</td>
                  <td className="p-2 border">{appt.notes}</td>
                  <td className="p-2 border">{appt.status}</td>
                  {user?.user_type === "doctor" && (
                    <td className="p-2 border">
                      {["Pending", "Confirmed", "Cancelled", "Completed"].map((status) => {
                        const isDisabled =
                          appt.status === "Cancelled" ||
                          appt.status === "Completed" ||
                          updatingIds.includes(appt.id);

                        return (
                          <button
                            key={status}
                            onClick={() => updateStatus(appt.id, status as Appointment["status"])}
                            disabled={isDisabled}
                            className={`text-xs px-2 py-1 rounded m-1 ${
                              appt.status === status
                                ? "bg-blue-700 text-white"
                                : "bg-blue-200 hover:bg-blue-300"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}
