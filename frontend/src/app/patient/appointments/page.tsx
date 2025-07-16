"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookAppointment() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    axios
      .get("http://localhost:8000/api/v1/users/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoctors(res.data))
      .catch(() => setError("Failed to load doctors"));
  }, []);

  // ✅ Update timeslots on doctor change
  useEffect(() => {
    const selectedDoctor = doctors.find((d) => d.id == doctorId);
    if (selectedDoctor?.available_timeslots) {
      setAvailableSlots(selectedDoctor.available_timeslots.split(","));
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, doctors]);

  // ✅ Submit appointment
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!doctorId || !appointmentTime || !notes) {
      setError("All fields are required");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0]; // e.g. 2025-07-16
      const fullDateTime = `${today}T${appointmentTime}`;
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/api/v1/appointments",
        {
          doctor_id: parseInt(doctorId),
          appointment_time: fullDateTime,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Appointment booked successfully");
      router.push("/patient/profile");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Booking failed";
      setError(msg);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">📅 Book Appointment</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full border p-2 rounded"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name} (৳{doctor.consultation_fee})
            </option>
          ))}
        </select>

        <select
          className="w-full border p-2 rounded"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          disabled={!availableSlots.length}
        >
          <option value="">Select Time Slot</option>
          {availableSlots.map((slot, idx) => (
            <option key={idx} value={slot}>{slot}</option>
          ))}
        </select>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Notes / Symptoms"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}
