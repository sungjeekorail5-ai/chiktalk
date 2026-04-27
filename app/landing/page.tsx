"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 사이버펑크 / 미래 코레일 랜딩 시안
 * URL: /landing
 *
 * 메인 홈(/)은 그대로 두고, 이 페이지를 시안용으로 별도 운영.
 * 마음에 들면 page.tsx 내용으로 교체.
 */
export default function LandingPage() {
  const [time, setTime] = useState<string>("--:--:--");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
      const yy = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dow = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];
      setDate(`${yy}.${mo}.${dd} ${dow}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040818] text-white">
      {/* ─────────── 배경 레이어 ─────────── */}
      <BackgroundFx />

      {/* ─────────── 콘텐츠 ─────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* 상단: 로고 + 시계 */}
        <header className="flex items-center justify-between mb-12 md:mb-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.6)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="14" rx="3" />
                <path d="M8 21l-2-4M16 21l2-4" />
                <circle cx="9" cy="14" r="0.8" fill="white" />
                <circle cx="15" cy="14" r="0.8" fill="white" />
                <path d="M6 8h12" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.3em] text-cyan-300/80">
                CHIKCHIK · TALKTALK
              </p>
              <p className="text-base font-extrabold tracking-tight">
                칙칙톡톡{" "}
                <span className="text-cyan-300 font-bold text-xs">v2026</span>
              </p>
            </div>
          </div>

          {/* 라이브 시계 */}
          <div className="text-right">
            <p className="text-[10px] font-extrabold tracking-[0.2em] text-cyan-300/60">
              SEOUL · KST
            </p>
            <p className="text-xl md:text-2xl font-extrabold tabular-nums text-cyan-100 [text-shadow:0_0_10px_rgba(34,211,238,0.4)]">
              {time}
            </p>
            <p className="text-[10px] text-cyan-300/60 tabular-nums">{date}</p>
          </div>
        </header>

        {/* 메인 히어로 */}
        <main className="space-y-8 md:space-y-12">
          {/* 카피 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-400/10 border border-cyan-400/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-widest text-cyan-300">
                  STAFF NETWORK ONLINE
                </span>
              </span>
            </div>

            <h1 className="text-[40px] md:text-[80px] leading-[1.05] font-black tracking-tight">
              <span className="block">철도인을 잇는</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-cyan-100 to-white bg-clip-text text-transparent">
                새로운 궤도
              </span>
            </h1>

            <p className="text-base md:text-lg text-cyan-100/70 max-w-xl leading-relaxed">
              게시판 · 사내 앱 보관함 · 코레일 CBT · 급여계산기.
              <br />
              필요한 모든 도구를 한 화면에서.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/board"
                className="group relative px-6 py-3 bg-cyan-400 text-[#040818] font-extrabold rounded-full overflow-hidden active:scale-95 transition-transform"
              >
                <span className="relative z-10 tracking-wide">시작하기 →</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/web"
                className="px-6 py-3 border border-cyan-400/40 text-cyan-100 font-bold rounded-full hover:border-cyan-300 active:scale-95 transition-all"
              >
                Web 앱 둘러보기
              </Link>
            </div>
          </div>

          {/* 라이브 위젯 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Stat label="기출문제" value="5,979" suffix="문항" />
            <Stat label="AI 사규문제" value="2,960" suffix="문항" />
            <Stat label="도식 이미지" value="356" suffix="장" />
            <Stat label="네트워크" value="ONLINE" suffix="" mono />
          </div>

          {/* 진입 카드 4종 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <ModuleCard
              href="/board"
              code="01"
              title="게시판"
              en="COMMUNITY"
              desc="동료들과 자유롭게 이야기"
              accent="cyan"
            />
            <ModuleCard
              href="/web/cbt"
              code="02"
              title="코레일 CBT"
              en="EXAM SIMULATOR"
              desc="기출 + AI 사규문제 풀이"
              accent="green"
              badge="WEB"
            />
            <ModuleCard
              href="/web/payroll"
              code="03"
              title="급여계산기"
              en="PAYROLL CALCULATOR"
              desc="통상임금 · 급여 명세 미리보기"
              accent="amber"
              badge="WEB"
            />
            <ModuleCard
              href="/apps"
              code="04"
              title="앱 보관함"
              en="APP REPOSITORY"
              desc="사내 APK 다운로드"
              accent="violet"
            />
          </div>

          {/* 푸터 */}
          <footer className="pt-8 md:pt-12 border-t border-cyan-400/10 flex items-center justify-between text-[10px] text-cyan-300/40 tracking-widest">
            <span>UNOFFICIAL · KORAIL EMPLOYEES INTERNAL TOOLKIT</span>
            <span className="tabular-nums">© 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 배경 효과 (그리드 + 글로우 + 트레일)
// ────────────────────────────────────────────────────────────────
function BackgroundFx() {
  return (
    <>
      {/* 그라데이션 글로우 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.15),_transparent_50%)]" />
      <div className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] bg-[radial-gradient(circle,_rgba(34,211,238,0.1),_transparent_70%)] blur-3xl" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[80%] h-[80%] bg-[radial-gradient(circle,_rgba(59,130,246,0.08),_transparent_70%)] blur-3xl" />

      {/* 그리드 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* 빛 트레일 (KTX 속도감) */}
      <div className="absolute top-1/3 -left-32 w-[60%] h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-60 [animation:cbt-trail_5s_linear_infinite]" />
      <div className="absolute top-2/3 -left-32 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-40 [animation:cbt-trail_7s_linear_infinite_2s]" />
      <div className="absolute top-[15%] -left-32 w-[30%] h-[1px] bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-30 [animation:cbt-trail_9s_linear_infinite_4s]" />

      {/* 노이즈 (선택) */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none [background-image:radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] [background-size:3px_3px]" />

      {/* 애니메이션 keyframes */}
      <style>{`
        @keyframes cbt-trail {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(180vw); opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// 통계 위젯
// ────────────────────────────────────────────────────────────────
function Stat({
  label,
  value,
  suffix,
  mono = false,
}: {
  label: string;
  value: string;
  suffix: string;
  mono?: boolean;
}) {
  return (
    <div className="relative bg-[#0A1024]/60 border border-cyan-400/15 backdrop-blur-sm rounded-2xl p-4 overflow-hidden">
      {/* 코너 액센트 */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60" />

      <p className="text-[10px] font-extrabold tracking-widest text-cyan-300/60 mb-1">
        {label}
      </p>
      <p
        className={`text-2xl md:text-3xl font-extrabold tabular-nums text-cyan-100 [text-shadow:0_0_12px_rgba(34,211,238,0.3)] ${
          mono ? "text-base md:text-lg" : ""
        }`}
      >
        {value}
        {suffix && (
          <span className="text-xs font-bold opacity-60 ml-0.5">{suffix}</span>
        )}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 모듈 카드 (게시판/CBT/급여/앱 진입)
// ────────────────────────────────────────────────────────────────
function ModuleCard({
  href,
  code,
  title,
  en,
  desc,
  accent,
  badge,
}: {
  href: string;
  code: string;
  title: string;
  en: string;
  desc: string;
  accent: "cyan" | "green" | "amber" | "violet";
  badge?: string;
}) {
  const accentMap = {
    cyan: "from-cyan-400/20 to-cyan-600/5 border-cyan-400/30 text-cyan-300",
    green: "from-emerald-400/20 to-emerald-600/5 border-emerald-400/30 text-emerald-300",
    amber: "from-amber-400/20 to-amber-600/5 border-amber-400/30 text-amber-300",
    violet: "from-violet-400/20 to-violet-600/5 border-violet-400/30 text-violet-300",
  }[accent];

  return (
    <Link
      href={href as any}
      className={`group relative bg-gradient-to-br ${accentMap} border backdrop-blur-sm rounded-2xl p-5 md:p-6 overflow-hidden hover:-translate-y-0.5 transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-extrabold tracking-[0.2em] opacity-50">
          MODULE / {code}
        </span>
        {badge && (
          <span className="text-[9px] font-extrabold bg-cyan-400 text-[#040818] px-1.5 py-0.5 rounded leading-none">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
        {title}
      </h3>
      <p className="text-[11px] font-extrabold tracking-[0.2em] opacity-60 mb-3">
        {en}
      </p>
      <p className="text-sm text-white/70 leading-snug">{desc}</p>
      <div className="flex items-center gap-1 mt-5 text-xs font-extrabold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
        ENTER
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
