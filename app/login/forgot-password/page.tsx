"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (res.ok) setMessage("이메일로 재설정 링크가 발송되었습니다! 💌");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">비밀번호 찾기 🚂</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="가입한 이메일을 입력하세요"
          className="w-full px-4 py-3 border rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
          재설정 링크 보내기
        </button>
      </form>
      {message && <p className="mt-4 text-blue-600 text-center text-sm">{message}</p>}
    </div>
  );
}