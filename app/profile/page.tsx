"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) console.log("현재 탑승객 정보:", user);
  }, [user]);

  const handleLogout = async () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      await logout();
      alert("로그아웃 되었습니다.");
      router.push("/");
    }
  };

  const isStaff = !!user;
  const isAdmin = user?.id === "sungjee90";
  const initial = user?.nickname?.charAt(0) || "?";

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      <div className="max-w-2xl mx-auto px-5 md:px-4 py-6 md:py-6 space-y-6 md:space-y-8">
        {/* 1. 타이틀 */}
        <div>
          <h1 className="text-[26px] md:text-3xl font-extrabold text-gray-900 tracking-tight">
            내 정보
          </h1>
          <p className="text-sm text-gray-400 font-semibold mt-0.5">
            계정과 활동 기록을 확인해요
          </p>
        </div>

        {/* 2. 프로필 카드 */}
        <div className="bg-gray-50 rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-600">
                {initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900 truncate">
                {user ? user.nickname : "로딩 중..."}
              </h2>
              {user?.id && (
                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                  @{user.id}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4">
            <span
              className={`text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-md tracking-wide ${
                isStaff
                  ? "bg-blue-100 text-blue-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {isStaff ? "STAFF" : "GUEST"}
            </span>
            {isAdmin && (
              <span className="text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-600 tracking-wide">
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* 3. 활동 메뉴 */}
        <section>
          <SectionLabel>활동</SectionLabel>
          <MenuGroup>
            <MenuItem
              href="/profile/posts"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
              }
              label="내가 쓴 글"
            />
          </MenuGroup>
        </section>

        {/* 4. 계정 메뉴 */}
        <section>
          <SectionLabel>계정</SectionLabel>
          <MenuGroup>
            <MenuItem
              href="/profile/password"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              label="비밀번호 변경"
            />
            <MenuItem
              onClick={handleLogout}
              danger
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              }
              label="로그아웃"
            />
          </MenuGroup>
        </section>

        {/* 5. 푸터 */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-gray-300 font-extrabold tracking-[0.3em]">
            CHIKCHIK TALKTALK
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-extrabold text-gray-500 tracking-wide pl-1 mb-2">
      {children}
    </p>
  );
}

function MenuGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
      {children}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  icon,
  label,
  danger,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  const inner = (
    <div
      className={`w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 transition-colors ${
        danger ? "text-red-500" : "text-gray-800"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          danger ? "bg-red-50" : "bg-gray-100"
        }`}
      >
        {icon}
      </div>
      <span className="flex-1 text-[15px] font-bold tracking-tight">{label}</span>
      {!danger && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href as any} className="block">
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}
