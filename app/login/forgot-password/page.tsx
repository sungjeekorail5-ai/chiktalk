"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
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
        setMessage("인증번호가 이메일로 발송되었습니다. 잠시 후 재설정 페이지로 이동합니다.");
        setTimeout(() => {
          router.push(
            `/login/reset-password?email=${encodeURIComponent(email)}` as Route
          );
        }, 1500);
      } else {
        setIsError(true);
        setMessage(data.message || "요청에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch {
      setIsError(true);
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 상단 백 네비 */}
      <div className="md:hidden flex items-center px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/login"
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">뒤로</span>
        </Link>
      </div>

      <div className="max-w-md mx-auto px-5 md:px-4 pt-8 md:pt-20 pb-12">
        <div className="md:bg-white md:p-10 md:rounded-3xl md:shadow-sm md:border md:border-gray-100">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            비밀번호 찾기
          </h1>
          <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
            가입하신 이메일을 입력하시면<br />
            인증번호를 보내드릴게요.
          </p>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">이메일</label>
              <input
                type="email"
                placeholder="가입한 이메일 입력"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-extrabold text-white bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-[0.98]"
            >
              {isLoading ? "발송 중..." : "인증번호 보내기"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs font-bold text-center ${
                isError ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
