import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "../lib/AuthContext";
import NavbarClient from "../components/NavbarClient";

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
                <a href="/apps" className="hover:text-blue-600 transition-colors uppercase tracking-wider">Apps</a>
                <a href="/board" className="hover:text-blue-600 transition-colors uppercase tracking-wider">Board</a>
                
                <span className="hidden md:inline text-gray-300">|</span>
                
                {/* 💡 로그인 버튼 & 닉네임 영역을 클라이언트 컴포넌트로 교체! */}
                <NavbarClient isLoggedIn={isLoggedIn} isRealUser={isRealUser} />
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}