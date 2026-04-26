import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("session");

  return (
    <>
      {/* ============================ MOBILE ============================ */}
      <div className="md:hidden px-5 pt-8 pb-12 space-y-10">
        {/* 1. 브랜드 헤더 */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="3" width="16" height="14" rx="3" />
                <path d="M8 21l-2-4M16 21l2-4" />
                <circle cx="9" cy="14" r="0.8" fill="white" />
                <circle cx="15" cy="14" r="0.8" fill="white" />
                <path d="M6 8h12" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
              칙칙톡톡
            </h2>
          </div>
          <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-gray-900">
            안녕하세요!
            <br />
            오늘도 편안한 하루 되세요.
          </h1>
          <p className="mt-2 text-sm font-semibold text-gray-500">
            코레일 직원들을 위한 공간
          </p>
        </section>

        {/* 2. 메인 액션 */}
        {isLoggedIn ? (
          <section className="space-y-3">
            <Link
              href="/board"
              className="block bg-gray-900 text-white p-6 rounded-3xl active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-[11px] font-bold opacity-70 tracking-wider">
                    커뮤니티
                  </p>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    게시판
                  </h3>
                  <p className="text-sm opacity-75 leading-snug">
                    동료들과 자유롭게 이야기해 보세요.
                  </p>
                </div>
                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </div>
            </Link>
            <Link
              href="/apps"
              className="block bg-blue-50 text-blue-600 p-6 rounded-3xl active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-[11px] font-bold opacity-70 tracking-wider">
                    다운로드
                  </p>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    앱 보관함
                  </h3>
                  <p className="text-sm opacity-80 leading-snug">
                    업무용 앱을 모아봤어요.
                  </p>
                </div>
                <div className="w-12 h-12 shrink-0 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
              </div>
            </Link>
          </section>
        ) : (
          <section className="bg-gray-50 p-6 rounded-3xl">
            <h3 className="text-lg font-extrabold tracking-tight text-gray-900">
              로그인이 필요해요
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-600 leading-relaxed">
              게시판과 앱 보관함을 이용하려면
              <br />
              먼저 로그인해 주세요.
            </p>
            <Link
              href="/login"
              className="block w-full text-center bg-blue-600 active:bg-blue-700 text-white font-bold py-4 rounded-2xl mt-5"
            >
              로그인하러 가기
            </Link>
          </section>
        )}

        {/* 3. 이용 안내 */}
        <section>
          <h3 className="text-lg font-extrabold tracking-tight text-gray-900 mb-3">
            이용 안내
          </h3>
          <div className="divide-y divide-gray-100">
            <InfoItem
              title="코레일 이메일로만 가입"
              desc="@korail.com 이메일 인증이 필요해요."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />
                </svg>
              }
            />
            <InfoItem
              title="사내 전용 앱 보관함"
              desc="STAFF 인증을 거친 직원만 받을 수 있어요."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
            <InfoItem
              title="실시간 알림"
              desc="내 글에 댓글이 달리면 알려드려요."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
              }
            />
          </div>
        </section>
      </div>

      {/* ============================ DESKTOP (기존) ============================ */}
      <div className="hidden md:flex flex-col items-center justify-center min-h-[85vh] text-center px-6 relative overflow-hidden">
        <div className="relative mb-6 group flex flex-col items-center w-full">
          <div className="flex justify-center w-full mb-10 group-hover:animate-drift transition-transform">
            <div className="w-16 h-1 bg-gray-100 rounded-full mx-1"></div>
            <div className="w-28 h-1.5 bg-blue-500 rounded-full mx-1 shadow-2xl shadow-blue-200"></div>
            <div className="relative">
              <div className="w-48 h-2 bg-blue-600 rounded-full mx-1 shadow-lg shadow-blue-100"></div>
            </div>
          </div>
          <div className="flex items-center justify-center group-hover:animate-drift transition-all">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-8 flex items-center justify-center">
              <span className="text-gray-950">칙칙</span>
              <span className="text-blue-600 font-extrabold">톡톡</span>
            </h1>
          </div>
          <p className="text-xl md:text-3xl text-gray-400 font-black tracking-tight mt-6">
            CHIKCHIK <span className="text-gray-900 break-keep">TALK & APPS</span>
          </p>
        </div>

        <div className="flex flex-row gap-5 max-w-lg mt-12">
          {isLoggedIn ? (
            <>
              <a
                href="/apps"
                className="flex-1 bg-gray-950 hover:bg-blue-600 text-white font-black py-6 px-8 rounded-[2rem] shadow-2xl transition-all hover:-translate-y-2 active:scale-95 text-xl flex items-center justify-center gap-2 whitespace-nowrap"
              >
                CHIK APPS
              </a>
              <a
                href="/board"
                className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-900 font-black py-6 px-8 rounded-[2rem] shadow-sm transition-all hover:-translate-y-2 active:scale-95 text-xl flex items-center justify-center gap-2 whitespace-nowrap"
              >
                CHIK TALK
              </a>
            </>
          ) : (
            <a
              href="/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 px-12 rounded-full shadow-2xl shadow-blue-100 transition-all hover:-translate-y-2 active:scale-95 text-2xl flex items-center justify-center"
            >
              열차 탑승하기
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function InfoItem({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-9 h-9 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-gray-900 leading-tight">
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
