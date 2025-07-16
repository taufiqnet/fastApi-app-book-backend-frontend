"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Helper: get today's date in yyyy-mm-dd
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Helper: format time for display
const formatTimeDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${suffix}`;
};

export default function BookAppointment() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(getTodayDate());
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // ✅ Load doctors
  useEffect(() => {
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/users/doctors",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctors(response.data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      }
    };

    fetchDoctors();
  }, [token]);

  // ✅ Update timeslots when doctor changes
  useEffect(() => {
    if (!doctorId) {
      setAvailableSlots([]);
      return;
    }

    const selectedDoctor = doctors.find((d) => d.id == doctorId);
    if (selectedDoctor?.available_timeslots) {
      setAvailableSlots(
        selectedDoctor.available_timeslots
          .split(",")
          .map((slot: string) => slot.trim())
          .filter((slot: string) => slot)
      );
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, doctors]);

  // ✅ Submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!doctorId || !appointmentDate || !appointmentTime || !notes) {
      setError("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const fullDateTime = `${appointmentDate}T${appointmentTime}:00`;

      await axios.post(
        "http://localhost:8000/api/v1/appointment/appointments", // ✅ CORRECT endpoint
        {
          doctor_id: parseInt(doctorId),
          appointment_time: fullDateTime,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Appointment booked successfully!");
      router.push("/patient/profile");
    } catch (err: any) {
      console.error("Booking error:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to book appointment.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">📅 Book Appointment</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Doctor Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Doctor</label>
          <select
            className="w-full border p-2 rounded"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name} (৳{doctor.consultation_fee})
              </option>
            ))}
          </select>
        </div>

        {/* Date Input */}
        <div>
          <label className="block mb-1 font-medium">Appointment Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={appointmentDate}
            min={getTodayDate()}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
        </div>

        {/* Time Slot Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Time Slot</label>
          <select
            className="w-full border p-2 rounded"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
            disabled={!availableSlots.length}
          >
            <option value="">Select Time Slot</option>
            {availableSlots.map((slot, idx) => (
              <option key={idx} value={slot}>
                {formatTimeDisplay(slot)}
              </option>
            ))}
          </select>
          {!availableSlots.length && doctorId && (
            <p className="text-sm text-gray-500 mt-1">
              No available slots for this doctor.
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-1 font-medium">Notes / Symptoms</label>
          <textarea
            className="w-full border p-2 rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Describe your condition briefly"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}
