import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 💡 1. 뷰포트는 그대로 유지!
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "칙칙톡톡 | 대한민국 철도 TALK & APP",
  description: "대한민국 철도 사내 애플리케이션 및 자유게시판",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  const isLoggedIn = !!session;
  const isRealUser = isLoggedIn && session !== "guest_session";

  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* 🚀 상단 네비게이션 바 (모바일에서 높이 줄임: py-2) */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 flex justify-between items-center">
            
            {/* 🏠 로고 영역 (모바일에서 더 작게: text-lg, 기차 이모지 숨김) */}
            <Link href="/" className="text-lg sm:text-2xl font-black tracking-tighter flex items-center group flex-shrink-0">
              <span className="text-gray-900">칙칙</span><span className="text-blue-600">톡톡</span>
              {/* PC에서만 기차 보이기 */}
              <span className="hidden sm:flex items-center ml-1 -mt-2 whitespace-nowrap opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <span className="text-2xl">🚄</span>
              </span>
            </Link>

            {/* 🔗 메뉴 및 사용자 상태 영역 (가장 많이 터지는 부분!) */}
            {/* gap-2로 꽉 붙이고 text-xs로 글자 크기 최소화 */}
            <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-bold text-gray-600">
              
              {/* 모바일에서는 영어 메뉴(Apps, Board)만 보이기 */}
              <Link href="/apps" className="hover:text-blue-600 transition-colors uppercase tracking-wider">Apps</Link>
              <Link href="/board" className="hover:text-blue-600 transition-colors uppercase tracking-wider">Board</Link>
              
              {/* 모바일에서는 세로선 숨기기 */}
              <span className="hidden md:inline text-gray-300">|</span>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  {/* 신분 배지 (모바일에서 아주 작게: text-[7px]) */}
                  <span className={`text-[7px] sm:text-[10px] px-1 py-0.5 rounded font-black border flex-shrink-0 ${
                    isRealUser ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-amber-100 text-amber-600 border-amber-200"
                  }`}>
                    {isRealUser ? 'STAFF' : 'GUEST'}
                  </span>
                  
                  {/* 로그아웃 버튼 (모바일에서 패딩 최소화) */}
                  <Link href="/api/auth/logout" className="bg-gray-100 text-gray-600 px-2 sm:px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                    <span className="sm:hidden">OFF</span> {/* 모바일용 짧은 텍스트 */}
                    <span className="hidden sm:inline">로그아웃</span>
                  </Link>
                </div>
              ) : (
                <Link href="/login" className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                    <span className="sm:hidden">GO</span>
                    <span className="hidden sm:inline">로그인</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 중앙 정렬 컨테이너 (모바일에서 py-4로 여백 줄임) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
          {children}
        </div>
      </body>
    </html>
  );
}