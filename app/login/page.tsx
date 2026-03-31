"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const router = useRouter();

  // 🚀 공통 로그인 함수 (회원/비회원 겸용)
  const executeLogin = async (idValue: string, pwValue: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idValue, password: pwValue }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh(); 
      } else {
        const data = await res.json();
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      setError("서버 통신 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 일반 로그인 핸들러
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(userId, password);
  };

  // 💡 [수정] 비회원 로그인 핸들러
  const handleGuestLogin = () => {
    // 서버 API로 'guest'라고 쏴서 비회원용 쿠키를 받아옵니다.
    executeLogin("guest", "skip_password");
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-950">열차 탑승하기 🚂</h1>
          <p className="text-gray-500 font-medium">칙칙톡톡 서비스를 이용해 보세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="아이디" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 text-lg disabled:opacity-50"
          >
            {isLoading ? "승차 확인 중..." : "로그인"}
          </button>
        </form>

        <div className="space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">OR</span></div>
          </div>

          <div className="text-center space-y-3">
            {/* 💡 [변경] Link 대신 button으로 바꾸고 handleGuestLogin 연결! */}
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              비회원 로그인
            </button>
            <p className="text-[11px] text-gray-400 font-medium">
              (비회원은 일부 앱 및 게시판 이용이 불가합니다)
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm font-bold text-gray-400 pt-2">
            <Link href="/signup" className="hover:text-blue-600 transition-colors">회원가입</Link>
            <span className="text-gray-200">|</span>
            <Link href="/login/forgot-password" className="hover:text-blue-600 transition-colors">비밀번호 찾기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}