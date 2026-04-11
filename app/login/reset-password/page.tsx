"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다! ❌");
      return;
    }

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!pwRegex.test(newPassword)) {
      setMessage("비밀번호는 영문+숫자+특수문자 포함 8~20자여야 합니다! 🔒");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("비밀번호가 변경되었습니다! 🎉 로그인해 주세요.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "재설정에 실패했습니다.");
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold mb-4">유효하지 않은 링크입니다 ❌</h2>
        <p className="text-gray-500 mb-6">비밀번호 찾기를 다시 시도해 주세요.</p>
        <button
          onClick={() => router.push("/login/forgot-password")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          비밀번호 찾기로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">새 비밀번호 설정 🔑</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="영문+숫자+특수문자 8~20자"
          className="w-full px-4 py-3 border rounded-xl"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          className="w-full px-4 py-3 border rounded-xl"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-bold text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "변경 중..." : "비밀번호 변경하기 🚄"}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.includes("🎉") ? "text-blue-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-20 p-8 text-center">로딩 중...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
