"use client";

import Layout from "@/components/Layout";
import Notification from "@/components/Notification";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const formatTimeDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

export default function BookAppointment() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(getTodayDate());
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification State
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const showNotification = (message: string, type: "success" | "error") => {
    setNotificationMessage(message);
    setNotificationType(type);
  };

  const hideNotification = () => {
    setNotificationMessage("");
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      showNotification("Please login to book appointments", "error");
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/users/doctors",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDoctors(response.data);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        showNotification("Failed to load doctors. Please try again later.", "error");
      }
    };

    fetchDoctors();
  }, [token]);

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
          .filter(Boolean)
      );
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!doctorId || !appointmentDate || !appointmentTime || !notes) {
      showNotification("All fields are required", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const timeWithSeconds = appointmentTime.includes(":00")
        ? appointmentTime
        : `${appointmentTime}:00`;
      const fullDateTime = `${appointmentDate}T${timeWithSeconds}`;

      await axios.post(
        "http://localhost:8000/api/v1/appointment/appointments",
        {
          doctor_id: parseInt(doctorId),
          appointment_time: fullDateTime,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showNotification("Appointment booked successfully!", "success");
      setTimeout(() => {
        router.push("/patient/profile");
      }, 2000);
    } catch (err: any) {
      console.error("Booking error:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to book appointment. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Book Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block mb-1 font-medium">Time Slot</label>
            <select
              className="w-full border p-2 rounded"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              disabled={!availableSlots.length}
              required
            >
              <option value="">Select Time Slot</option>
              {availableSlots.map((slot, idx) => (
                <option key={idx} value={slot}>
                  {formatTimeDisplay(slot)}
                </option>
              ))}
            </select>
            {!availableSlots.length && doctorId && (
              <p className="text-sm text-gray-500 mt-1">No available slots for this doctor</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Notes/Symptoms</label>
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Describe your symptoms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>

      {notificationMessage && (
        <Notification
          message={notificationMessage}
          type={notificationType}
          onClose={hideNotification}
        />
      )}
    </Layout>
  );
}
