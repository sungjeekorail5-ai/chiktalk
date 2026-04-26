"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email || !code) return setMessage("이메일과 인증번호를 입력해주세요.");
    if (newPassword !== confirmPassword)
      return setMessage("비밀번호가 일치하지 않습니다.");

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!pwRegex.test(newPassword))
      return setMessage("영문+숫자+특수문자 포함 8~20자여야 합니다.");

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setMessage("비밀번호가 변경되었습니다. 로그인해 주세요.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "재설정에 실패했습니다.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 백 네비 */}
      <div className="md:hidden flex items-center px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/login/forgot-password"
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
            새 비밀번호 설정
          </h1>
          <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
            이메일로 받은 6자리 인증번호와<br />
            새 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">이메일</label>
              <input
                type="email"
                placeholder="가입한 이메일"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">인증번호</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6자리 인증번호"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-center font-extrabold text-lg tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">새 비밀번호</label>
              <input
                type="password"
                placeholder="영문+숫자+특수문자 8~20자"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold tracking-wider placeholder:text-gray-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">비밀번호 확인</label>
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold tracking-wider placeholder:text-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-extrabold text-white bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-[0.98] mt-2"
            >
              {isLoading ? "변경 중..." : "비밀번호 변경하기"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs font-bold text-center ${
                isSuccess ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={() => router.push("/login/forgot-password")}
            className="mt-4 w-full text-xs font-semibold text-gray-400 active:text-gray-600 py-2"
          >
            인증번호 다시 받기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-20 p-8 text-center text-gray-400 font-bold">
          로딩 중...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
