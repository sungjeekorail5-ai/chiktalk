"use client";

import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

export default function NavbarClient({
  isLoggedIn,
  isRealUser,
}: {
  isLoggedIn: boolean;
  isRealUser: boolean;
}) {
  const { user, logout } = useAuth();

  // 1) 로그아웃 상태
  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="bg-gray-900 hover:bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-colors whitespace-nowrap"
      >
        로그인
      </a>
    );
  }

  // 2) 로그인 상태
  return (
    <div className="flex items-center gap-2 md:gap-3">
      {user && (
        <span className="hidden lg:inline text-gray-900 font-bold text-sm">
          {user.nickname}님
        </span>
      )}

      <span
        className={`text-[10px] md:text-[11px] px-1.5 py-0.5 rounded-md font-extrabold tracking-wide ${
          isRealUser
            ? "bg-blue-50 text-blue-600"
            : "bg-amber-50 text-amber-600"
        }`}
      >
        {isRealUser ? "STAFF" : "GUEST"}
      </span>

      {/* 내 정보 (PC 전용) */}
      <Link
        href={"/profile" as any}
        className="hidden md:flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap font-bold text-sm"
      >
        내 정보
      </Link>

      <button
        onClick={logout}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 md:px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-colors whitespace-nowrap"
      >
        로그아웃
      </button>
    </div>
  );
}
