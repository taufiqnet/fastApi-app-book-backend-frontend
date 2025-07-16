"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errorList: string[] = [];

    if (!email) errorList.push("Email is required");
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      errorList.push("Invalid email format");

    if (!password) errorList.push("Password is required");
    else if (password.length < 8)
      errorList.push("Password must be at least 8 characters");

    setErrors(errorList);
    return errorList.length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login", {
        email,
        password,
      });

      const { access_token, user_type, email: userEmail } = res.data;

      // Store token + optionally user data
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_type", user_type);
      localStorage.setItem("email", userEmail);

      // Debug: Log the full response
      console.log("Login response:", res.data);

      // Redirect based on role
      if (user_type === "admin") router.push("/admin/profile");
      else if (user_type === "doctor") router.push("/doctor/profile");
      else if (user_type === "patient") router.push("/patient/profile");
      else {
        alert("Unknown user type: " + user_type);
        router.push("/");
      }

    } catch (err: any) {
      const msg = err.response?.data?.detail || "Unknown error";
      setErrors([`Login failed: ${msg}`]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}
