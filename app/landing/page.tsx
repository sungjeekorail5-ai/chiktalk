// 🚆 칙칙톡톡 랜딩 v3 — Railroad.ai 톤 헤로
//
// 객실 이미지의 검정 창문 영역에 풍경을 겹쳐
// 좌→우 무한 스크롤 + 미세한 흔들림으로
// 실제로 KTX를 타고 가는 듯한 시네마틱 헤로.
//
// 이미지:
//   /landing/train-interior.png  — 객실 (창문은 검정으로 비어있음)
//   /landing/landscape.png       — 한국 봄 풍경 (벚꽃·논·산·노을)

import Link from "next/link";

export const metadata = {
  title: "칙칙톡톡 — Next Station, Future.",
  description: "코레일 스태프를 위한 디지털 정거장.",
};

export default function LandingV3Page() {
  return (
    <div className="bg-[#050609] text-white min-h-screen overflow-hidden">
      {/* ──────────────── 헤더 ──────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] md:text-[11px] font-mono font-bold tracking-[0.3em] text-white/70">
            CHIKTALK / EST. 2026
          </p>
        </div>
        <p className="hidden md:block text-[10px] font-mono tracking-[0.25em] text-white/50">
          KORAIL STAFF · ONLINE
        </p>
      </header>

      {/* ──────────────── 헤로 (풀스크린) ──────────────── */}
      <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
        {/* 객실 + 풍경 (한 묶음으로 흔들림) */}
        <div className="absolute inset-0 hero-shake">
          {/* 객실 (베이스) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/train-interior.png"
            alt="KTX cabin"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* 풍경 클립 — 객실의 검정 창문 영역에만 보이게 */}
          <div
            className="absolute overflow-hidden"
            style={{
              // 창문 좌표 (객실 이미지 비율 기준 추정 — 실측 후 미세조정 가능)
              top: "5%",
              left: "12%",
              right: "10%",
              bottom: "18%",
              borderRadius: "24px",
            }}
          >
            {/* 좌→우 무한 스크롤 트랙 (3장: 정상 → 거울 → 정상) */}
            <div className="landscape-track absolute top-0 left-0 h-full flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/landscape.png"
                alt=""
                className="h-full w-auto object-cover shrink-0 select-none"
                draggable={false}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/landscape.png"
                alt=""
                className="h-full w-auto object-cover shrink-0 select-none"
                draggable={false}
                style={{ transform: "scaleX(-1)" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/landscape.png"
                alt=""
                className="h-full w-auto object-cover shrink-0 select-none"
                draggable={false}
              />
            </div>

            {/* 창문 안쪽 글로우 (분위기) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)",
              }}
            />
          </div>
        </div>

        {/* 헤로 콘텐츠 (흔들리지 않음 — 가독성) */}
        <div className="relative z-30 h-full flex flex-col justify-end px-6 md:px-12 pb-14 md:pb-20">
          <div className="max-w-6xl">
            {/* 메타 라벨 */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="inline-block w-8 h-px bg-white/60" />
              <p className="text-[10px] md:text-[11px] font-mono tracking-[0.3em] text-white/70">
                LINE 01 · KORAIL DIGITAL STATION
              </p>
            </div>

            {/* 거대 타이포 */}
            <h1 className="font-black tracking-tight leading-[0.88]">
              <span className="block text-[14vw] md:text-[10vw] lg:text-[8.5vw] bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                NEXT STATION,
              </span>
              <span className="block text-[14vw] md:text-[10vw] lg:text-[8.5vw] italic font-light text-white/95">
                future.
              </span>
            </h1>

            {/* 서브 카피 */}
            <p className="mt-6 md:mt-8 max-w-md md:max-w-lg text-[15px] md:text-[17px] leading-relaxed text-white/75 font-medium">
              코레일 스태프를 위한 디지털 정거장.
              <br />
              <span className="text-white/55">
                Built for those who keep Korea moving.
              </span>
            </p>

            {/* CTA */}
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-3 md:gap-4">
              <Link
                href={"/web" as any}
                className="group inline-flex items-center gap-3 bg-white text-black px-6 md:px-7 py-3.5 md:py-4 rounded-full text-sm md:text-base font-extrabold tracking-tight active:scale-[0.97] transition-transform"
              >
                <span>BOARDING</span>
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href={"/board" as any}
                className="inline-flex items-center gap-2 px-5 md:px-6 py-3.5 md:py-4 rounded-full text-sm md:text-base font-bold text-white/90 border border-white/25 hover:bg-white/10 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                EXPLORE
              </Link>
            </div>
          </div>
        </div>

        {/* 우상단 메타 위젯 */}
        <div className="hidden md:block absolute top-20 right-10 z-30">
          <div className="text-right space-y-1.5">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/50">
              EXAM · AI · IMAGES
            </p>
            <div className="flex items-center justify-end gap-3 text-white">
              <Stat n="5,979" />
              <span className="text-white/30 font-mono">/</span>
              <Stat n="2,960" />
              <span className="text-white/30 font-mono">/</span>
              <Stat n="356" />
            </div>
          </div>
        </div>

        {/* 우하단 스크롤 인디케이터 */}
        <div className="hidden md:flex absolute bottom-8 right-10 z-30 items-center gap-2 text-white/50">
          <p className="text-[10px] font-mono tracking-[0.3em]">SCROLL</p>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
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

      {/* ──────────────── 푸터 ──────────────── */}
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

      {/* ──────────────── 글로벌 키프레임 ──────────────── */}
      <style>{`
        /* 풍경 스크롤 — 좌→우 무한 (앞으로 가는 느낌) */
        @keyframes ktx-track {
          from { transform: translateX(0); }
          to   { transform: translateX(-66.6667%); } /* 3장 중 1장 폭만큼 */
        }
        .landscape-track {
          animation: ktx-track 38s linear infinite;
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

        /* 모션 줄이기 옵션 존중 */
        @media (prefers-reduced-motion: reduce) {
          .landscape-track { animation-duration: 90s; }
          .hero-shake { animation: none; }
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────
// 통계 숫자 (헤로 우상단 — 모노스페이스)
// ────────────────────────────────────────────────
function Stat({ n }: { n: string }) {
  return (
    <span className="text-base md:text-lg font-mono font-bold tabular-nums tracking-tight">
      {n}
    </span>
  );
}

// ────────────────────────────────────────────────
// 모듈 카드 — 베노 스타일, 호버 시 보더 페이드
// ────────────────────────────────────────────────
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
