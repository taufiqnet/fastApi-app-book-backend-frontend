"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile_number: "",
    password: "",
    user_type: "patient",
    division: "",
    district: "",
    thana: "",
    license_number: "",
    experience_years: "",
    consultation_fee: "",
    available_timeslots: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [thanas, setThanas] = useState<string[]>([]);

  useEffect(() => {
    setDivisions(["Dhaka", "Chattogram", "Khulna"]);
  }, []);

  useEffect(() => {
    const mapping: any = {
      Dhaka: ["Dhaka", "Gazipur"],
      Chattogram: ["Ctg City"],
      Khulna: ["Khulna City"],
    };
    setDistricts(mapping[form.division] || []);
    setForm((f) => ({ ...f, district: "", thana: "" }));
  }, [form.division]);

  useEffect(() => {
    const mapping: any = {
      Dhaka: ["Dhanmondi", "Mirpur"],
      Gazipur: ["Tongi"],
      "Ctg City": ["Kotwali"],
      "Khulna City": ["Khalishpur"],
    };
    setThanas(mapping[form.district] || []);
    setForm((f) => ({ ...f, thana: "" }));
  }, [form.district]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("❌ Only JPEG/PNG images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Image must be less than 5MB");
        return;
      }
      setProfileImage(file);
    }
  };

  const validateForm = async () => {
    const errorList: string[] = [];

    if (!form.full_name) errorList.push("Full name is required");
    if (!form.email) errorList.push("Email is required");
    if (!form.mobile_number.match(/^\+88\d{11}$/)) errorList.push("Invalid mobile number (+88 format)");
    if (
      !form.password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    ) errorList.push("Password must be strong: 1 uppercase, 1 digit, 1 special char");

    if (!["admin", "doctor", "patient"].includes(form.user_type))
      errorList.push("Invalid user type");

    if (!form.division || !form.district || !form.thana)
      errorList.push("Complete address (division, district, thana) is required");

    if (!profileImage) errorList.push("Profile image is required");

    if (form.user_type === "doctor") {
      if (!form.license_number) errorList.push("License number required for doctors");
      if (!form.experience_years) errorList.push("Experience years required");
      if (!form.consultation_fee) errorList.push("Consultation fee required");
      if (!form.available_timeslots.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/))
        errorList.push("Available timeslot format must be like 10:00-11:00");
    }

    // Optional: Check if email or mobile is unique (call backend)
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/check-email", {
        email: form.email,
        mobile_number: form.mobile_number,
      });
      if (!res.data.ok) errorList.push("Email or mobile already exists");
    } catch (e) {}

    setErrors(errorList);
    return errorList.length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!(await validateForm())) return;

    const formData = new FormData();
    for (const key in form) formData.append(key, (form as any)[key]);
    if (profileImage) formData.append("profile_image", profileImage);

    try {
      await axios.post("http://localhost:8000/api/v1/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Registration successful!");
      router.push("/auth/login");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "❌ Registration failed.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            <ul>{errors.map((err, idx) => <li key={idx}>• {err}</li>)}</ul>
          </div>
        )}

        <input className="w-full border p-2 rounded" name="full_name" placeholder="Full Name" onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="email" placeholder="Email" onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="mobile_number" placeholder="Mobile (+880...)" onChange={handleChange} />
        <input className="w-full border p-2 rounded" type="password" name="password" placeholder="Password" onChange={handleChange} />
        <select name="user_type" className="w-full border p-2 rounded" onChange={handleChange}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        {form.user_type === "doctor" && (
          <>
            <input className="w-full border p-2 rounded" name="license_number" placeholder="License Number" onChange={handleChange} />
            <input className="w-full border p-2 rounded" name="experience_years" type="number" placeholder="Experience Years" onChange={handleChange} />
            <input className="w-full border p-2 rounded" name="consultation_fee" type="number" placeholder="Consultation Fee" onChange={handleChange} />
            <input className="w-full border p-2 rounded" name="available_timeslots" placeholder="Timeslot (e.g., 10:00-11:00)" onChange={handleChange} />
          </>
        )}

        <select name="division" onChange={handleChange} className="w-full border p-2 rounded" value={form.division}>
          <option value="">Select Division</option>
          {divisions.map((d) => <option key={d}>{d}</option>)}
        </select>

        <select name="district" onChange={handleChange} className="w-full border p-2 rounded" value={form.district}>
          <option value="">Select District</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>

        <select name="thana" onChange={handleChange} className="w-full border p-2 rounded" value={form.thana}>
          <option value="">Select Thana</option>
          {thanas.map((t) => <option key={t}>{t}</option>)}
        </select>

        <input type="file" accept=".png,.jpeg,.jpg" onChange={handleImage} className="w-full border p-2 rounded" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Register</button>
      </form>
    </div>
  );
}
