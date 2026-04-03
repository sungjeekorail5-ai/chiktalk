"use client";

import { useAuth } from "@/lib/AuthContext";
import Link from "next/link"; 

export default function NavbarClient({ isLoggedIn, isRealUser }: { isLoggedIn: boolean, isRealUser: boolean }) {
  const { user, logout } = useAuth();

  // 1️⃣ 로그아웃 상태일 때
  if (!isLoggedIn) {
    return (
      <a href="/login" className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
        <span className="sm:hidden">GO</span>
        <span className="hidden sm:inline">로그인</span>
      </a>
    );
  }

  // 2️⃣ 로그인 상태일 때
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* 💡 닉네임 표시부: 닉네임이 있으면 띄워줍니다 */}
      {user && (
        <span className="hidden lg:inline text-gray-900 font-black mr-1 animate-fade-in">
          🚄 {user.nickname}님
        </span>
      )}

      <span className={`text-[7px] sm:text-[10px] px-1 py-0.5 rounded font-black border flex-shrink-0 ${
        isRealUser ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-amber-100 text-amber-600 border-amber-200"
      }`}>
        {isRealUser ? 'STAFF' : 'GUEST'}
      </span>
      
      {/* 🚀 [신규 추가] PC 웹용 '내 정보' 버튼 */}
      <Link 
        href={"/profile" as any}
        className="hidden md:flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all whitespace-nowrap font-bold text-sm shadow-sm"
      >
        내 정보 🎫
      </Link>

      <button 
        onClick={logout}
        className="bg-gray-100 text-gray-600 px-2 sm:px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap font-bold"
      >
        <span className="sm:hidden">OFF</span>
        <span className="hidden sm:inline">로그아웃</span>
      </button>
    </div>
  );
}