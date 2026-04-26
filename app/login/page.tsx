"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/AuthContext";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const executeLogin = async (idValue: string, pwValue: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idValue, password: pwValue }),
      });
      const data = await res.json();
      if (res.ok) {
        login(idValue, data.nickname, data.korailVerified);
        router.push("/");
        router.refresh();
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch {
      setError("서버 통신 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(userId, password);
  };

  const handleGuestLogin = () => executeLogin("guest", "skip_password");

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      <div className="max-w-md mx-auto px-5 md:px-4 pt-8 md:pt-20 pb-12">
        <div className="md:bg-white md:p-10 md:rounded-[2.5rem] md:shadow-sm md:border md:border-gray-100 space-y-8">
          {/* 로고 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              칙칙<span className="text-blue-600">톡톡</span>
            </h1>
            <p className="text-gray-400 font-semibold text-sm">
              대한민국 철도인 커뮤니티
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">
                아이디
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold placeholder:text-gray-400"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 active:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-base disabled:bg-gray-200 disabled:text-gray-400 mt-2"
            >
              {isLoading ? "확인 중..." : "로그인"}
            </button>
          </form>

          <div className="space-y-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-bold tracking-wider">
                  OR
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gray-100 active:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              비회원으로 둘러보기
            </button>

            <div className="flex justify-center gap-5 text-xs font-bold text-gray-400 pt-2">
              <Link
                href="/signup"
                className="active:text-blue-600 transition-colors"
              >
                회원가입
              </Link>
              <span className="text-gray-200">|</span>
              <Link
                href="/login/forgot-password"
                className="active:text-blue-600 transition-colors"
              >
                비밀번호 찾기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
