import type { Metadata, Viewport } from "next"; // 💡 Viewport 추가
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 💡 1. 모바일 반응형의 핵심: Viewport 설정 추가
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
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          {/* 💡 2. 모바일에서 양옆 간격(px-4)과 높이를 조절 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            
            {/* 🏠 로고 영역 (모바일에서 글자 크기 살짝 조절) */}
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tighter flex items-center group">
              <span className="text-gray-900">칙칙</span><span className="text-blue-600">톡톡</span>
              <span className="flex items-center ml-1 -mt-1 sm:-mt-2 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-all">
                <span className="text-xl sm:text-2xl">🚄</span>
              </span>
            </Link>

            {/* 🔗 메뉴 영역 (모바일에서 간격 좁히기: gap-3 -> gap-8로 가변형) */}
            <div className="flex items-center gap-3 sm:gap-8 text-sm font-bold text-gray-600">
              <Link href="/apps" className="hover:text-blue-600 transition-colors uppercase">Apps</Link>
              <Link href="/board" className="hover:text-blue-600 transition-colors uppercase">Board</Link>
              
              {/* 모바일에서는 세로선 숨기기 */}
              <span className="hidden sm:inline text-gray-300">|</span>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* 신분 배지 (모바일에서 글자 더 작게) */}
                  <span className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-black border ${
                    isRealUser ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-amber-100 text-amber-600 border-amber-200"
                  }`}>
                    {isRealUser ? 'Staff' : 'Guest'}
                  </span>
                  
                  <Link href="/api/auth/logout" className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 sm:px-4 py-2 rounded-xl hover:bg-gray-200">
                    로그아웃
                  </Link>
                </div>
              ) : (
                <Link href="/login" className="text-xs sm:text-sm bg-blue-50 text-blue-600 px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-100">
                  로그인
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 💡 3. 본문 컨테이너 (모바일에서 패딩 줄임) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {children}
        </div>
      </body>
    </html>
  );
}