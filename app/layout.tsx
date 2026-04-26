import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "../lib/AuthContext";
import NavbarClient from "../components/NavbarClient";
import BottomNav from "../components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "칙칙톡톡 | 대한민국 철도 TALK & APP",
  description: "철도 사내 애플리케이션 및 자유게시판",
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
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <AuthProvider>
          {/* 상단 헤더 */}
          <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 h-14 md:h-16 flex justify-between items-center">
              <Link
                href="/"
                className="text-lg md:text-2xl font-extrabold tracking-tight flex items-center"
              >
                <span className="text-gray-900">칙칙</span>
                <span className="text-blue-600">톡톡</span>
              </Link>

              <div className="flex items-center gap-3 md:gap-6 text-sm font-bold text-gray-600">
                <a
                  href="/apps"
                  className="hover:text-blue-600 transition-colors uppercase tracking-wider hidden md:inline"
                >
                  Apps
                </a>
                <a
                  href="/board"
                  className="hover:text-blue-600 transition-colors uppercase tracking-wider hidden md:inline"
                >
                  Board
                </a>
                <a
                  href="/cbt"
                  className="hover:text-blue-600 transition-colors uppercase tracking-wider hidden md:inline-flex items-center gap-1"
                >
                  CBT
                  <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1 py-px rounded">WEB</span>
                </a>

                <span className="hidden md:inline text-gray-200">|</span>

                <NavbarClient isLoggedIn={isLoggedIn} isRealUser={isRealUser} />
              </div>
            </div>
          </nav>

          {/*
            모바일: 좌우 패딩 0 (페이지 안에서 직접 패딩 관리) — 풀폭 레이아웃 가능
            PC: 기존 컨테이너
          */}
          <main className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8 py-0 md:py-10 pb-24 md:pb-10 min-h-screen">
            {children}
          </main>

          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
