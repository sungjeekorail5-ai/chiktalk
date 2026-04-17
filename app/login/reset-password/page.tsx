"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      setMessage("이메일과 인증번호를 입력해주세요.");
      return;
    }

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
        body: JSON.stringify({ email, code, newPassword }),
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

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">새 비밀번호 설정 🔑</h2>
      <p className="text-sm text-gray-500 mb-4">
        이메일로 받은 6자리 인증번호를 입력하세요.
      </p>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="가입한 이메일"
          className="w-full px-4 py-3 border rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6자리 인증번호"
          className="w-full px-4 py-3 border rounded-xl tracking-widest text-center font-bold text-lg"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />
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
      <button
        onClick={() => router.push("/login/forgot-password")}
        className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
      >
        인증번호를 다시 받으시려면 여기를 클릭하세요
      </button>
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
