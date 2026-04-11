"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsError(false);
        setMessage("이메일로 재설정 링크가 발송되었습니다! 💌");
      } else {
        setIsError(true);
        setMessage(data.message || "요청에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch {
      setIsError(true);
      setMessage("서버 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
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
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-bold text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "발송 중..." : "재설정 링크 보내기"}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${isError ? "text-red-500" : "text-blue-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
