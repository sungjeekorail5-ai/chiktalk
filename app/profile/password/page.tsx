"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!pwRegex.test(newPassword)) {
      alert("비밀번호는 영문+숫자+특수문자 포함 8~20자여야 합니다.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "비밀번호 변경에 실패했습니다.");
        return;
      }
      alert("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
      router.push("/login");
    } catch {
      alert("비밀번호 변경 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 백 네비 */}
      <div className="md:hidden flex items-center px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/profile"
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">뒤로</span>
        </Link>
      </div>

      <div className="max-w-md mx-auto px-5 md:px-4 py-6 space-y-6">
        <div>
          <h1 className="text-[22px] md:text-2xl font-extrabold text-gray-900 tracking-tight">
            비밀번호 변경
          </h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">
            안전한 새 비밀번호로 변경해 주세요
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-700">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold tracking-wider placeholder:text-gray-400"
              placeholder="기존 비밀번호 입력"
              required
            />
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold tracking-wider placeholder:text-gray-400"
                placeholder="영문+숫자+특수문자 8~20자"
                required
              />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold tracking-wider placeholder:text-gray-400"
              placeholder="새 비밀번호 확인"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-extrabold text-white bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-[0.98]"
          >
            {isLoading ? "변경 중..." : "비밀번호 변경하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
