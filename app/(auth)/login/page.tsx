"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? "فشل تسجيل الدخول");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full flex items-center justify-center bg-[#F7F8FA]">
      <form onSubmit={handleSubmit} className="bg-white border border-[#EAECF0] rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-[#101828] mb-6">تسجيل الدخول</h1>
        {error && <p className="text-sm text-[#F04438] mb-4">{error}</p>}

        <label className="block text-sm text-[#667085] mb-1">البريد الإلكتروني</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#D0D5DD] rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F5EFF]"
          required
        />

        <label className="block text-sm text-[#667085] mb-1">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#D0D5DD] rounded-lg px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F5EFF]"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1F5EFF] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}