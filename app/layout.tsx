import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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

  // 💡 [권한 체크 로직]
  const isLoggedIn = !!session;
  const isRealUser = isLoggedIn && session !== "guest_session";

  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* 🚀 상단 내비게이션 바 고정 */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            
            {/* 🏠 로고 영역 */}
            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center group">
              <span className="text-gray-900">칙칙</span><span className="text-blue-600">톡톡</span>
              <span className="flex items-center ml-1 -mt-2 whitespace-nowrap opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300">
                <span className="text-2xl">🚄</span>
                <span className="text-xl">💨</span>
              </span>
            </Link>

            {/* 🔗 메뉴 및 사용자 상태 영역 */}
            <div className="flex items-center gap-8 text-sm font-bold text-gray-600">
              <Link href="/apps" className="hover:text-blue-600 transition-colors uppercase tracking-widest">Apps</Link>
              <Link href="/board" className="hover:text-blue-600 transition-colors uppercase tracking-widest">Board</Link>
              <span className="text-gray-300">|</span>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  {/* 💡 [신규] 로그인 상태에 따라 신분 배지 노출 */}
                  {isRealUser ? (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-md font-black uppercase tracking-tighter border border-blue-200 shadow-sm">
                      Staff
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-md font-black uppercase tracking-tighter border border-amber-200 shadow-sm">
                      Guest
                    </span>
                  )}
                  
                  <Link href="/api/auth/logout" className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                    로그아웃
                  </Link>
                </div>
              ) : (
                <Link href="/login" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                  로그인
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 중앙 정렬 컨테이너 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}