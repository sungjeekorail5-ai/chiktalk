// 🚆 칙칙톡톡 랜딩 v3.1 — Railroad.ai 톤 헤로
//
// 객실 PNG의 검정 창문을 투명으로 변환해 풍경 위에 자연스럽게 합성.
//
// 파이프라인:
//   /landing/landscape.png   — 풍경 (좌→우 무한 스크롤)
//   /landing/train-cutout.png — 객실 (창문이 투명, 풍경 위에 올라감)
//
// v3.0 → v3.1 변경:
//   1. 풍경을 130% zoom + 더 빠른 스크롤 → 가로 흐름이 더 풍부
//   2. 거울 제거, 풍경 4장 정상 이어 붙이기 + 양 끝 fade gradient
//   3. 객실은 컷아웃 PNG 사용 → 풍경 위에 올라가서 창문 영역에만 풍경 노출
//   4. 풍경 아래쪽은 객실의 창문 하단 곡선/베젤이 자연스럽게 가리고, 추가 비네팅
//   5. 객실에 brightness/saturate 필터로 밝게 + 따뜻한 오버레이

import Link from "next/link";

export const metadata = {
  title: "칙칙톡톡 — Next Station, Future.",
  description: "코레일 스태프를 위한 디지털 정거장.",
};

export default function LandingV3Page() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#050609] text-white overflow-y-auto overflow-x-hidden">
      {/* ──────────────── 헤로 ──────────────── */}
      <section className="relative w-full bg-black flex items-center justify-center min-h-[100svh]">
        {/* 객실 비율 컨테이너 (1915×821 = 2.33:1 유지) */}
        <div
          className="relative ktx-frame"
          style={{
            width: "min(100vw, calc(100vh * 1915 / 821))",
            height: "min(100vh, calc(100vw * 821 / 1915))",
          }}
        >
          {/* ─── 합성: 풍경(아래) → 객실 컷아웃(위) ─── */}
          <div className="absolute inset-0 hero-shake">
            {/* 1. 풍경 (객실 창문 위치/크기에 정확히 맞춤) */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: "15.1%",
                left: "15%",
                right: "15%",
                bottom: "20%",
              }}
            >
              {/* 풍경 트랙 — 4장 정상 이어 붙이기 (거울 X) */}
              <div className="landscape-track absolute top-0 left-0 h-full flex">
                {[0, 1, 2, 3].map((i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src="/landing/landscape.png"
                    alt=""
                    className="h-full w-auto object-cover shrink-0 select-none"
                    draggable={false}
                    style={{
                      // 풍경을 살짝 zoom (가로로 더 길게 흐르는 느낌)
                      transform: "scale(1.18)",
                      transformOrigin: "center center",
                    }}
                  />
                ))}
              </div>

              {/* 양 끝 fade — 풍경 점프컷 가림 */}
              <div
                className="absolute inset-y-0 left-0 w-[8%] pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.85), transparent)",
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-[8%] pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to left, rgba(0,0,0,0.85), transparent)",
                }}
              />

              {/* 아래쪽 fade — 풍경 모션블러 깨진 느낌 가림 */}
              <div
                className="absolute inset-x-0 bottom-0 h-[18%] pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                }}
              />

              {/* 전체 비네팅 (창문 안 분위기) */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </div>

            {/* 2. 객실 컷아웃 (창문 투명) — 풍경 위로 올라옴 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/train-cutout.png"
              alt="KTX cabin"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
              style={{
                filter: "brightness(1.18) saturate(1.05) contrast(0.96)",
              }}
            />

            {/* 3. 따뜻한 오버레이 (객실 톤 보정 — 터널 같은 느낌 줄이기) */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,180,90,0.06) 0%, transparent 30%, transparent 70%, rgba(255,200,120,0.04) 100%)",
              }}
            />
          </div>

          {/* ─── 헤로 콘텐츠 (흔들리지 않음) ─── */}
          <div className="absolute inset-0 z-30 flex flex-col justify-end p-5 md:p-10 pointer-events-none">
            <div className="max-w-5xl pointer-events-auto">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <span className="inline-block w-6 h-px bg-white/60" />
                <p className="text-[9px] md:text-[10px] font-mono tracking-[0.3em] text-white/70">
                  LINE 01 · KORAIL DIGITAL STATION
                </p>
              </div>

              <h1
                className="font-black tracking-tight leading-[0.88]"
                style={{ textShadow: "0 6px 40px rgba(0,0,0,0.6)" }}
              >
                <span className="block text-[11vw] md:text-[7vw] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                  NEXT STATION,
                </span>
                <span className="block text-[11vw] md:text-[7vw] italic font-light text-white/95">
                  future.
                </span>
              </h1>

              <p
                className="mt-3 md:mt-5 max-w-md text-[12px] md:text-[15px] leading-relaxed text-white/85 font-medium"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
              >
                코레일 스태프를 위한 디지털 정거장.
                <br />
                <span className="text-white/60">
                  Built for those who keep Korea moving.
                </span>
              </p>

              <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-2 md:gap-3">
                <Link
                  href={"/web" as any}
                  className="group inline-flex items-center gap-2 bg-white text-black px-4 md:px-6 py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-extrabold tracking-tight active:scale-[0.97] transition-transform"
                >
                  <span>BOARDING</span>
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
                <Link
                  href={"/board" as any}
                  className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-bold text-white/90 border border-white/30 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <span className="w-1 h-1 rounded-full bg-white/80" />
                  EXPLORE
                </Link>
              </div>
            </div>
          </div>

          {/* 우상단 통계 위젯 */}
          <div className="hidden md:block absolute top-6 right-6 z-30 pointer-events-none">
            <div className="text-right space-y-1">
              <p className="text-[9px] font-mono tracking-[0.25em] text-white/60">
                EXAM · AI · IMAGES
              </p>
              <div className="flex items-center justify-end gap-2 text-white">
                <Stat n="5,979" />
                <span className="text-white/40 font-mono">/</span>
                <Stat n="2,960" />
                <span className="text-white/40 font-mono">/</span>
                <Stat n="356" />
              </div>
            </div>
          </div>

          {/* 좌상단 라이브 인디케이터 */}
          <div className="absolute top-4 md:top-6 left-5 md:left-8 z-30 pointer-events-none flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[9px] md:text-[10px] font-mono font-bold tracking-[0.3em] text-white/85">
              CHIKTALK / EST. 2026
            </p>
          </div>
        </div>

        {/* 우하단 스크롤 인디케이터 */}
        <div className="hidden md:flex absolute bottom-6 right-6 z-30 items-center gap-2 text-white/50">
          <p className="text-[10px] font-mono tracking-[0.3em]">SCROLL</p>
          <div className="w-px h-7 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ──────────────── 모듈 섹션 ──────────────── */}
      <section className="relative px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-mono tracking-[0.3em] text-white/40">
              02 · MODULES
            </span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-3">
            모든 도구를
            <br />
            <span className="italic font-light text-white/60">한 정거장에서.</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base font-medium mb-12 md:mb-16 max-w-md">
            게시판부터 시험·급여까지. 코레일 스태프가 매일 쓰는 것들.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <ModuleCard
              code="01"
              title="BOARD"
              kor="게시판"
              desc="STAFF 인증 후 자유롭게 글을 남기고 의견을 모을 수 있어요."
              href="/board"
            />
            <ModuleCard
              code="02"
              title="CBT"
              kor="기출 + AI 사규문제"
              desc="기출 5,979 + AI 사규 2,960 + 도식 356장. 무한 퀴즈와 랭킹까지."
              href="/web/cbt"
              accent
            />
            <ModuleCard
              code="03"
              title="PAYROLL"
              kor="급여 계산기"
              desc="호봉제·연봉제 모두 지원. 4단계 위저드로 통상임금 계산."
              href="/web/payroll"
            />
            <ModuleCard
              code="04"
              title="APK"
              kor="안드로이드 앱"
              desc="등용팀장 시리즈 앱을 직접 받을 수 있어요. iOS는 웹으로."
              href="/apk"
            />
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] font-mono tracking-[0.25em] text-white/40">
            CHIKTALK · KORAIL STAFF ONLY · 2026
          </p>
          <p className="text-[11px] font-mono tracking-[0.25em] text-white/30">
            ALL STATIONS REACHED.
          </p>
        </div>
      </footer>

      {/* ──────────────── 키프레임 ──────────────── */}
      <style>{`
        /* 풍경 스크롤 — 좌→우 무한 (앞으로 가는 느낌, 더 빠르게) */
        @keyframes ktx-track {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); } /* 4장 중 2장만큼 */
        }
        .landscape-track {
          animation: ktx-track 24s linear infinite;
          will-change: transform;
        }

        /* 객실 + 풍경 통합 흔들림 (매우 미세) */
        @keyframes ktx-shake {
          0%, 100% { transform: translate(0, 0); }
          12% { transform: translate(-0.6px, 0.5px); }
          24% { transform: translate(0.7px, -0.4px); }
          36% { transform: translate(-0.4px, -0.6px); }
          48% { transform: translate(0.5px, 0.6px); }
          60% { transform: translate(-0.7px, 0.3px); }
          72% { transform: translate(0.6px, -0.5px); }
          84% { transform: translate(-0.5px, 0.5px); }
        }
        .hero-shake {
          animation: ktx-shake 0.65s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .landscape-track { animation-duration: 60s; }
          .hero-shake { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Stat({ n }: { n: string }) {
  return (
    <span className="text-sm md:text-base font-mono font-bold tabular-nums tracking-tight">
      {n}
    </span>
  );
}

function ModuleCard({
  code,
  title,
  kor,
  desc,
  href,
  accent,
}: {
  code: string;
  title: string;
  kor: string;
  desc: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href as any}
      className={`group relative overflow-hidden rounded-3xl border p-7 md:p-9 transition-all duration-500 ${
        accent
          ? "bg-gradient-to-br from-amber-500/15 via-rose-500/5 to-transparent border-amber-300/20 hover:border-amber-300/40"
          : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/25"
      }`}
    >
      <div className="flex items-start justify-between mb-10 md:mb-14">
        <span className="text-[10px] font-mono tracking-[0.3em] text-white/40">
          MODULE / {code}
        </span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>

      <p className="text-3xl md:text-4xl font-black tracking-tight mb-1.5">
        {title}
      </p>
      <p className="text-sm md:text-base text-white/70 font-bold mb-5">{kor}</p>

      <p className="text-[13px] md:text-sm text-white/50 leading-relaxed font-medium max-w-md">
        {desc}
      </p>

      <div className="absolute bottom-0 left-7 md:left-9 right-7 md:right-9 h-px bg-white/0 group-hover:bg-white/30 transition-colors duration-500" />
    </Link>
  );
}
