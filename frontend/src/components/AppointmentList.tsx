"use client";

import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Notification from "./Notification";

interface Appointment {
  id: number;
  full_name: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  notes: string;
  appointment_time: string;
}

interface User {
  email: string;
  user_type: "patient" | "doctor" | "admin";
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]); // track which appts updating
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);


  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/v1/users/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userRes.data);

        const apptRes = await axios.get("http://localhost:8000/api/v1/appointment/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAppointments(apptRes.data);
      } catch (err) {
        console.error("Error loading appointments", err);
        setNotification({ message: "Error loading appointments.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const updateStatus = async (id: number, newStatus: Appointment["status"]) => {
    if (!token) return;

    // Prevent updating if already updating
    if (updatingIds.includes(id)) return;

    // Disable updating for Cancelled or Completed
    const appt = appointments.find((a) => a.id === id);
    if (!appt || appt.status === "Cancelled" || appt.status === "Completed") return;

    try {
      setUpdatingIds((prev) => [...prev, id]);
      const res = await axios.patch(
        `http://localhost:8000/api/v1/appointment/appointments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 && res.data) {
        setAppointments((prev) =>
          prev.map((appt) => (appt.id === id ? res.data : appt))
        );
        setNotification({ message: "Appointment status updated successfully!", type: "success" });
      } else {
        throw new Error("Failed to update appointment status");
      }
    } catch (err) {
      console.error("Failed to update status", err);
      setNotification({ message: "Doctor appointment not updated", type: "error" });
    } finally {
      setUpdatingIds((prev) => prev.filter((apptId) => apptId !== id));
    }
  };

  if (loading) return <Layout><p>Loading appointments...</p></Layout>;

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
      <table className="w-full border">
        <thead className="bg-blue-100 text-left">
          <tr>
            <th className="p-2 border">#</th>
            {user?.user_type === "doctor" && <th className="p-2 border">Patient</th>}
            {user?.user_type === "patient" && <th className="p-2 border">Doctor</th>}
            <th className="p-2 border">Time</th>
            <th className="p-2 border">Notes</th>
            <th className="p-2 border">Status</th>
            {user?.user_type === "doctor" && <th className="p-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt, idx) => (
            <tr key={appt.id} className="hover:bg-gray-50">
              <td className="p-2 border">{idx + 1}</td>
              {user?.user_type !== "admin" && <td className="p-2 border">{appt.full_name}</td>}
              <td className="p-2 border">
                {new Date(appt.appointment_time).toLocaleString()}
              </td>
              <td className="p-2 border">{appt.notes}</td>
              <td className="p-2 border">{appt.status}</td>
              {user?.user_type === "doctor" && (
                <td className="p-2 border">
                  {["Pending", "Confirmed", "Cancelled", "Completed"].map((status) => {
                    const isDisabled =
                      appt.status === "Cancelled" || appt.status === "Completed" || updatingIds.includes(appt.id);

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
    </Layout>
  );
}
