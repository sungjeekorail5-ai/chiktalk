"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// 💡 절대 경로(@/)가 안 먹히면 ../../lib/AuthContext 로 경로를 확실히 잡으세요!
import { useAuth } from "../../lib/AuthContext";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // 💡 AuthContext에서 login 함수를 가져옵니다.
  const { login } = useAuth();

  // 🚀 공통 로그인 함수 (회원/비회원 겸용)
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
        login(idValue, data.nickname); 
        
        // 💡 페이지 이동 전 강제 새로고침 효과를 주어 레이아웃이 정보를 새로 읽게 합니다.
        router.push("/");
        router.refresh(); 
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("서버 통신 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(userId, password);
  };

  const handleGuestLogin = () => {
    executeLogin("guest", "skip_password");
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-950 italic tracking-tighter">
            CHIK <span className="text-blue-600">TALK</span> 🚂
          </h1>
          <p className="text-gray-400 font-bold text-sm">대한민국 철도인 커뮤니티</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-1">아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
              placeholder="아이디를 입력하세요" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-500 text-[11px] font-black text-center animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 text-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          >
            {isLoading ? "승차권 확인 중..." : "열차 탑승하기 🎫"}
          </button>
        </form>

        <div className="space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-300 font-black tracking-widest">OR</span></div>
          </div>

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-sm"
            >
              비회원(GUEST)으로 둘러보기
            </button>
          </div>

          <div className="flex justify-center gap-6 text-[12px] font-black text-gray-400 pt-2">
            <Link href="/signup" className="hover:text-blue-600 transition-colors">회원가입</Link>
            <span className="text-gray-200">|</span>
            <Link href="/login/forgot-password" className="hover:text-blue-600 transition-colors">비밀번호 찾기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}