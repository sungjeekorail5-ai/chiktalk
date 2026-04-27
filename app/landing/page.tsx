"use client";

import Link from "next/link";

/**
 * 사이버펑크 / 미래 코레일 랜딩 시안 v2
 * URL: /landing
 *
 * 거대 타이포 + SVG 미래 KTX + 강한 모션
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* ─────────── 배경 ─────────── */}
      <BackgroundFx />

      {/* ─────────── 콘텐츠 ─────────── */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 상단 미니 헤더 */}
        <header className="px-6 md:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-300 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.7)]" />
            <span className="text-[11px] font-extrabold tracking-[0.3em] text-white/80">
              CHIKTALK · KORAIL
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest text-cyan-300">
              ONLINE
            </span>
          </div>
        </header>

        {/* 히어로 — 좌측 카피 + 우측 KTX */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 px-6 md:px-12 pb-12">
          {/* 좌측: 거대 타이포 */}
          <div className="md:col-span-7 flex flex-col justify-center pt-4 md:pt-0">
            <p className="text-[11px] font-extrabold tracking-[0.4em] text-cyan-300 mb-4 md:mb-6">
              FOR KORAIL EMPLOYEES · 2026
            </p>

            <h1 className="font-black tracking-tight leading-[0.85]">
              <span className="block text-[14vw] md:text-[8.5vw] bg-gradient-to-br from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                NEXT
              </span>
              <span className="block text-[14vw] md:text-[8.5vw] bg-gradient-to-br from-cyan-200 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                STATION:
              </span>
              <span className="block text-[14vw] md:text-[8.5vw] italic text-white drop-shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                FUTURE.
              </span>
            </h1>

            <p className="mt-5 md:mt-6 text-base md:text-lg text-white/60 max-w-xl leading-relaxed">
              다음 정류장은, 미래.
              <br className="hidden md:block" />
              <span className="text-cyan-200/80">
                철도인의 일상을 잇는 한 줄, 새 궤도.
              </span>
            </p>

            {/* CTA */}
            <div className="mt-7 md:mt-10 flex flex-wrap gap-3">
              <Link
                href="/board"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-cyan-300 text-black font-extrabold tracking-wider rounded-full overflow-hidden active:scale-95 transition-transform"
              >
                <span className="relative z-10">BOARDING →</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-white to-cyan-300 [background-size:200%_100%] [animation:shimmer_3s_linear_infinite] opacity-0 group-hover:opacity-60 transition-opacity" />
              </Link>
              <Link
                href="/web"
                className="inline-flex items-center gap-1.5 px-7 py-3.5 border border-cyan-300/40 text-cyan-100 font-bold tracking-wider rounded-full hover:bg-cyan-300/5 hover:border-cyan-300 active:scale-95 transition-all"
              >
                EXPLORE
              </Link>
            </div>

            {/* 작은 라이브 인디케이터 */}
            <div className="mt-8 md:mt-12 flex items-center gap-6 text-[10px] font-extrabold tracking-[0.2em] text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-cyan-300 rounded-full animate-pulse" />
                NETWORK ACTIVE
              </span>
              <span>5,979 · EXAM</span>
              <span>2,960 · AI</span>
              <span className="hidden md:inline">356 · IMAGES</span>
            </div>
          </div>

          {/* 우측: 미래 KTX */}
          <div className="md:col-span-5 relative flex items-center justify-center min-h-[280px] md:min-h-[500px]">
            <FutureKtx />
          </div>
        </main>

        {/* 하단 모듈 진입 */}
        <footer className="px-6 md:px-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <ModuleLink href="/board" code="01" title="BOARD" sub="게시판" />
            <ModuleLink
              href="/web/cbt"
              code="02"
              title="CBT"
              sub="기출문제"
              accent
            />
            <ModuleLink
              href="/web/payroll"
              code="03"
              title="PAYROLL"
              sub="급여계산기"
              accent
            />
            <ModuleLink href="/apps" code="04" title="APK" sub="앱 보관함" />
          </div>
          <p className="mt-6 text-center text-[10px] font-extrabold tracking-[0.3em] text-white/20">
            UNOFFICIAL · KORAIL EMPLOYEES INTERNAL TOOLKIT · © 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 미래 KTX SVG (측면 각도 + 모션 + 글로우)
// ────────────────────────────────────────────────────────────────
function FutureKtx() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 글로우 후광 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(34,211,238,0.25),_transparent_60%)] blur-2xl" />

      {/* 트레일 (KTX 뒤로 흐르는 빛줄기) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[120%] h-[3px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-70 [animation:ktx-trail_2s_linear_infinite]" />
      <div className="absolute top-[55%] -translate-y-1/2 left-0 w-[120%] h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-50 [animation:ktx-trail_2.7s_linear_infinite_0.3s]" />
      <div className="absolute top-[45%] -translate-y-1/2 left-0 w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-40 [animation:ktx-trail_3.3s_linear_infinite_0.7s]" />

      {/* KTX 본체 — 살짝 위아래 흔들림 */}
      <svg
        viewBox="0 0 600 300"
        className="relative w-full h-auto max-w-[600px] [animation:ktx-hover_4s_ease-in-out_infinite] drop-shadow-[0_0_40px_rgba(34,211,238,0.4)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 본체 그라데이션 */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0F7FF" />
            <stop offset="40%" stopColor="#9FD8E8" />
            <stop offset="100%" stopColor="#0E5A7A" />
          </linearGradient>
          {/* 사이드 액센트 */}
          <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="1" />
            <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
          </linearGradient>
          {/* 전조등 */}
          <radialGradient id="headlightGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#A5F3FC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
          {/* 창문 그라데이션 */}
          <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1024" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          {/* 빛 콘 */}
          <radialGradient id="lightCone" cx="0" cy="0.5" r="1">
            <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 빛 콘 (전조등 앞 빛 줄기) */}
        <ellipse cx="80" cy="155" rx="80" ry="35" fill="url(#lightCone)" />

        {/* 메인 본체 — 유선형 */}
        <path
          d="M 80 145
             Q 70 130, 100 120
             L 540 120
             Q 580 120, 580 150
             L 580 175
             Q 580 195, 555 195
             L 110 195
             Q 80 195, 75 175
             Z"
          fill="url(#bodyGrad)"
          stroke="rgba(165,243,252,0.4)"
          strokeWidth="1"
        />

        {/* 헤드 노즈 (앞쪽 원뿔 강조) */}
        <path
          d="M 80 145
             Q 70 130, 100 120
             L 130 120
             L 110 195
             L 80 195
             Q 75 175, 75 165
             Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* 측면 액센트 라인 (시안 글로우) */}
        <line
          x1="120"
          y1="160"
          x2="570"
          y2="160"
          stroke="url(#accentGrad)"
          strokeWidth="2"
          opacity="0.9"
        >
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="140"
          y1="180"
          x2="555"
          y2="180"
          stroke="#22D3EE"
          strokeWidth="0.8"
          opacity="0.4"
        />

        {/* 창문들 */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i}
            x={150 + i * 30}
            y="135"
            width="20"
            height="14"
            rx="2"
            fill="url(#windowGrad)"
            stroke="rgba(165,243,252,0.3)"
            strokeWidth="0.5"
          />
        ))}

        {/* 작은 디테일 — 측면 LED 점 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle
            key={i}
            cx={170 + i * 50}
            cy="170"
            r="1.5"
            fill="#67E8F9"
          >
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${1 + (i % 3) * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.1}s`}
            />
          </circle>
        ))}

        {/* 전조등 */}
        <circle cx="98" cy="155" r="14" fill="url(#headlightGrad)">
          <animate
            attributeName="r"
            values="13;16;13"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="98" cy="155" r="5" fill="#FFFFFF" opacity="0.95" />

        {/* 노즈 끝 — 살짝 발광 */}
        <circle cx="80" cy="160" r="3" fill="#A5F3FC" opacity="0.7">
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* 바퀴 (단순화) */}
        <ellipse
          cx="180"
          cy="205"
          rx="20"
          ry="6"
          fill="rgba(0,0,0,0.5)"
          opacity="0.6"
        />
        <ellipse
          cx="450"
          cy="205"
          rx="20"
          ry="6"
          fill="rgba(0,0,0,0.5)"
          opacity="0.6"
        />

        {/* 측면 KTX 마크 */}
        <g transform="translate(310, 156)">
          <rect
            x="0"
            y="0"
            width="40"
            height="14"
            rx="2"
            fill="rgba(34,211,238,0.15)"
            stroke="#22D3EE"
            strokeWidth="0.5"
          />
          <text
            x="20"
            y="11"
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fill="#67E8F9"
            fontFamily="ui-sans-serif, system-ui"
            letterSpacing="2"
          >
            CHIK
          </text>
        </g>

        {/* 후미 라이트 */}
        <circle cx="575" cy="155" r="3" fill="#FCA5A5" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* 바닥 그림자 / 반사 */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[70%] h-2 bg-cyan-300/20 blur-md rounded-full" />

      <style>{`
        @keyframes ktx-hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ktx-trail {
          0% { transform: translateX(-30%) scaleX(0.8); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(20%) scaleX(1.4); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 배경 효과
// ────────────────────────────────────────────────────────────────
function BackgroundFx() {
  return (
    <>
      {/* 메인 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020611] via-[#040818] to-[#0A1530]" />

      {/* 거대 글로우 */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(circle,_rgba(34,211,238,0.18),_transparent_70%)] blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(circle,_rgba(59,130,246,0.12),_transparent_70%)] blur-3xl" />

      {/* 그리드 (느린 좌→우 패럴랙스) */}
      <div
        className="absolute inset-0 opacity-[0.08] [animation:grid-shift_60s_linear_infinite]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 90%)",
        }}
      />

      {/* 스캔라인 (살짝) */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* 광선 트레일 (배경 빠른 빛줄기) */}
      <div className="absolute top-[20%] -left-1/3 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-60 [animation:bg-trail_4s_linear_infinite]" />
      <div className="absolute top-[80%] -left-1/3 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 [animation:bg-trail_6s_linear_infinite_2s]" />

      <style>{`
        @keyframes grid-shift {
          0% { background-position: 0 0; }
          100% { background-position: 60px 0; }
        }
        @keyframes bg-trail {
          0% { transform: translateX(0); }
          100% { transform: translateX(250vw); }
        }
      `}</style>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// 하단 모듈 미니 카드 (CITYPUNKS의 NAV 느낌)
// ────────────────────────────────────────────────────────────────
function ModuleLink({
  href,
  code,
  title,
  sub,
  accent = false,
}: {
  href: string;
  code: string;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href as any}
      className={`group relative px-4 py-3 rounded-xl border backdrop-blur-sm transition-all hover:-translate-y-0.5 ${
        accent
          ? "bg-cyan-300/5 border-cyan-300/30 hover:border-cyan-300/60"
          : "bg-white/5 border-white/10 hover:border-white/30"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-extrabold tracking-[0.2em] text-white/40">
          {code}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${
            accent ? "text-cyan-300" : "text-white"
          }`}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <p
        className={`text-base font-extrabold tracking-wider ${
          accent ? "text-cyan-100" : "text-white"
        }`}
      >
        {title}
      </p>
      <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
    </Link>
  );
}
