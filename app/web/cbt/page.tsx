import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function CbtHomePage() {
  // 칙칙톡톡 세션 확인 (STAFF만 점수/오답/랭킹 기능 사용 가능)
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const isLoggedIn = !!session;
  const isStaff = isLoggedIn && session !== "guest_session";

  // 닉네임 (인사말용)
  let nickname = "";
  if (isStaff && session) {
    try {
      const userDoc = await adminDb.collection("users").doc(session).get();
      if (userDoc.exists) {
        nickname = (userDoc.data()?.nickname as string) || "";
      }
    } catch {
      // 무시
    }
  }

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      <div className="max-w-3xl mx-auto px-5 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* 헤더 */}
        <header className="space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-blue-600 uppercase">
              Korail CBT
            </p>
            <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none tracking-wider">
              WEB
            </span>
          </div>
          <h1 className="text-[26px] md:text-3xl font-extrabold text-gray-900 tracking-tight">
            코레일 기출문제집
          </h1>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            {nickname
              ? `${nickname}님, 오늘도 한 회차 풀어볼까요?`
              : "기출문제 + AI 사규문제 — 모든 기능"}
            <br />
            <span className="text-blue-600 font-bold">
              iOS·Android·PC 어디서든 동일하게 풀 수 있어요.
            </span>
          </p>
        </header>

        {/* 메인 카드 — 기출 모의고사 (검정 큰 카드) */}
        <Link
          href="/web/cbt/select"
          className="block bg-gray-900 text-white p-6 md:p-8 rounded-3xl active:scale-[0.98] md:hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <p className="text-[11px] font-bold opacity-70 tracking-wider">
                실전 기출
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                기출 모의고사
              </h2>
              <p className="text-sm md:text-base opacity-75 leading-snug">
                연도·직렬·과목 선택 후 한 회차 도전
              </p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>
        </Link>

        {/* 보조 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SubCard
            href="/web/cbt/infinite"
            title="무한 퀴즈"
            desc="AI가 만든 사규 문제, 한 문제 틀리면 끝"
            color="blue"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.4 8a8 8 0 0 0-13.4 4 8 8 0 0 0 13.4 4M22 4v4h-4" />
                <path d="M2 20v-4h4" />
              </svg>
            }
          />
          <SubCard
            href="/web/cbt/wrong"
            title="오답 노트"
            desc="틀린 문제만 모아서 다시 풀기"
            color="red"
            staffOnly={!isStaff}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
          />
          <SubCard
            href="/web/cbt/ranking"
            title="랭킹"
            desc="무한 퀴즈 최고 점수 TOP 100"
            color="amber"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
                <path d="M17 4h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4M7 4H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4" />
              </svg>
            }
          />
        </div>

        {/* 데이터 안내 */}
        <div className="bg-gray-50 rounded-2xl p-4 md:p-5">
          <p className="text-[13px] font-bold text-gray-700 mb-1">
            수록 데이터
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            기출문제 5,979문항 (2022~2025) · AI 사규문제 2,960문항 · 도식 이미지 356장
          </p>
        </div>

        {/* 칙칙톡톡 기능 안내 */}
        {!isStaff && (
          <div className="bg-amber-50 rounded-2xl p-4 md:p-5">
            <p className="text-[13px] font-bold text-amber-800 mb-1">
              로그인하면 더 많은 기능
            </p>
            <p className="text-xs text-amber-700 leading-relaxed mb-3">
              칙칙톡톡 STAFF 로그인 시 오답노트 자동 저장, 점수 랭킹 등록이 가능해요.
            </p>
            <Link
              href="/login"
              className="inline-block bg-amber-600 active:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              로그인하러 가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SubCard({
  href,
  title,
  desc,
  color,
  icon,
  staffOnly,
}: {
  href: string;
  title: string;
  desc: string;
  color: "blue" | "red" | "amber";
  icon: React.ReactNode;
  staffOnly?: boolean;
}) {
  const palette = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
    red: { bg: "bg-red-50", text: "text-red-500", iconBg: "bg-red-100" },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      iconBg: "bg-amber-100",
    },
  }[color];

  return (
    <Link
      href={href as any}
      className={`block ${palette.bg} ${palette.text} p-5 rounded-2xl active:scale-[0.98] md:hover:-translate-y-0.5 transition-all`}
    >
      <div
        className={`w-10 h-10 ${palette.iconBg} rounded-xl flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-base font-extrabold tracking-tight">{title}</p>
      <p className="text-[11px] opacity-75 mt-0.5 leading-snug">{desc}</p>
      {staffOnly && (
        <span className="inline-block mt-2 text-[10px] font-extrabold bg-white/70 px-1.5 py-0.5 rounded">
          로그인 필요
        </span>
      )}
    </Link>
  );
}
