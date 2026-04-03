"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // 💡 메뉴 리스트 (원하시는 메뉴로 자유롭게 수정 가능!)
  const navItems = [
    { name: "홈", path: "/", icon: "🏠" },
    { name: "자유게시판", path: "/board", icon: "💬" },
    { name: "앱 보관함", path: "/apps", icon: "📦" },
    { name: "내 정보", path: "/profile", icon: "👤" },
  ];

  return (
    // md:hidden 을 줘서 PC 화면에서는 숨기고, 모바일에서만 보이게 합니다.
    // pb-[env(safe-area-inset-bottom)] 로 아이폰 하단 홈 바 영역을 보호합니다.
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          // 현재 페이지인지 확인해서 활성화 색상 적용
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Link 
              key={item.name} 
              href={item.path as any} 
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
            >
              <span className={`text-xl transition-colors ${isActive ? "grayscale-0" : "grayscale opacity-40"}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-black transition-colors ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}