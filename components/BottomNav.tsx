"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // 풀이/시험 진행 중인 페이지에서는 BottomNav 숨김 (몰입 방해 X)
  const isImmersivePage =
    pathname.startsWith("/web/cbt/quiz") ||
    pathname.startsWith("/web/cbt/result");
  if (isImmersivePage) return null;

  const navItems = [
    {
      name: "홈",
      path: "/",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      name: "게시판",
      path: "/board",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      name: "앱",
      path: "/apps",
      icon: (active: boolean) => (
        // 4개 그리드 — 앱 보관함 (APK)
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      name: "앱",
      path: "/web",
      badge: "WEB",
      icon: (active: boolean) => (
        // 글로브 — 웹에서 실행 의미
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      name: "내 정보",
      path: "/profile",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              href={item.path as any}
              className="flex flex-col items-center justify-center w-full h-full gap-0.5 active:scale-95 transition-transform relative"
            >
              <span className={isActive ? "text-blue-600" : "text-gray-300"}>
                {item.icon(isActive)}
              </span>
              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? "text-blue-600 font-extrabold" : "text-gray-400 font-bold"
                }`}
              >
                {item.name}
              </span>
              {item.badge && (
                <span className="absolute top-1 right-3 text-[8px] font-extrabold bg-blue-600 text-white px-1 py-px rounded-md leading-none tracking-wider">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
