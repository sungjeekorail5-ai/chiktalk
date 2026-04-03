import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "../lib/AuthContext";
import NavbarClient from "../components/NavbarClient";
import BottomNav from "../components/BottomNav"; // 💡 새롭게 추가한 하단 탭 바 컴포넌트

const inter = Inter({ subsets: ["latin"] });

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
  // 서버에서 로그인 여부를 미리 확인 (깜빡임 방지용)
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const isLoggedIn = !!session;
  const isRealUser = isLoggedIn && session !== "guest_session";

  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* 💡 전역 상태 우산을 씌워줍니다 */}
        <AuthProvider>
          <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 flex justify-between items-center">
              
              <Link href="/" className="text-lg sm:text-2xl font-black tracking-tighter flex items-center group flex-shrink-0">
                <span className="text-gray-900">칙칙</span><span className="text-blue-600">톡톡</span>
                <span className="hidden sm:flex items-center ml-1 -mt-2 whitespace-nowrap opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <span className="text-2xl">🚄</span>
                </span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-bold text-gray-600">
                {/* 💡 모바일에서는 하단 탭 바가 있으니, 상단의 Apps와 Board는 PC(md)에서만 보이도록 hidden md:inline을 추가했습니다! */}
                <a href="/apps" className="hover:text-blue-600 transition-colors uppercase tracking-wider hidden md:inline">Apps</a>
                <a href="/board" className="hover:text-blue-600 transition-colors uppercase tracking-wider hidden md:inline">Board</a>
                
                <span className="hidden md:inline text-gray-300">|</span>
                
                {/* 💡 로그인 버튼 & 닉네임 영역 */}
                <NavbarClient isLoggedIn={isLoggedIn} isRealUser={isRealUser} />
              </div>
            </div>
          </nav>

          {/* 💡 pb-24 md:pb-10을 주어 모바일 하단바에 콘텐츠가 가려지지 않게 보호하고, PC에서는 여백을 줄입니다. */}
          {/* div 대신 웹 표준에 맞게 main 태그로 변경하고 min-h-screen을 추가했습니다. */}
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 pb-24 md:pb-10 min-h-screen">
            {children}
          </main>

          {/* 🚀 모바일 전용 하단 고정 탭 바 등판! */}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}