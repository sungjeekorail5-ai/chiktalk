import Link from "next/link";

export const dynamic = "force-dynamic";

interface WebApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  available: boolean;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

// 향후 확장: korail_3D, korail_payroll 등이 추가될 자리
const WEB_APPS: WebApp[] = [
  {
    id: "cbt",
    name: "코레일 CBT",
    tagline: "기출문제 + AI 사규문제",
    description:
      "5,979개 기출문제와 950개 AI 사규문제를 풀고 채점받을 수 있어요.",
    href: "/web/cbt",
    available: true,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13l2 2 4-4" />
      </svg>
    ),
  },
];

export default function WebAppsPage() {
  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      <div className="max-w-3xl mx-auto px-5 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* 헤더 */}
        <header className="space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-blue-600 uppercase">
              Chik Web Apps
            </p>
            <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none tracking-wider">
              WEB
            </span>
          </div>
          <h1 className="text-[26px] md:text-3xl font-extrabold text-gray-900 tracking-tight">
            앱 (Web)
          </h1>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            iOS 사용자를 위해 웹 환경에서도 앱을 사용할 수 있도록 만들었어요.
            <br />
            <span className="text-blue-600 font-bold">
              앱과 동일한 기능, 어떤 기기에서든 동일하게.
            </span>
          </p>
        </header>

        {/* 사용 가능한 앱 */}
        <section>
          <SectionLabel>사용 가능</SectionLabel>
          <div className="space-y-3 mt-3">
            {WEB_APPS.filter((a) => a.available).map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        {/* 준비중 안내 */}
        <section>
          <SectionLabel>곧 추가될 앱</SectionLabel>
          <div className="mt-3 bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              다른 코레일 사내 앱들도
              <br />
              순차적으로 웹 버전이 추가될 예정이에요.
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-2">
              필요한 앱이 있다면 게시판에 의견 남겨주세요!
            </p>
          </div>
        </section>

        {/* 안내 문구 */}
        <div className="bg-blue-50 rounded-2xl p-4 md:p-5">
          <p className="text-[13px] font-bold text-blue-900 mb-1">
            왜 웹으로도 만들었나요?
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">
            안드로이드 사용자는 <Link href="/apps" className="underline font-bold">앱 보관함</Link>
            에서 APK를 받을 수 있지만, iOS는 받을 방법이 없어요.
            그래서 동일한 기능을 웹에서도 쓸 수 있도록 옮겼습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-extrabold text-gray-500 tracking-wide pl-1">
      {children}
    </p>
  );
}

function AppCard({ app }: { app: WebApp }) {
  return (
    <Link
      href={app.href as any}
      className="block bg-gray-50 active:bg-gray-100 md:hover:-translate-y-0.5 transition-all p-5 md:p-6 rounded-3xl"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 shrink-0 ${app.iconBg} ${app.iconColor} rounded-2xl flex items-center justify-center`}
        >
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight truncate">
              {app.name}
            </h3>
            <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none">
              WEB
            </span>
          </div>
          <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">
            {app.tagline}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 font-medium mt-1 leading-snug line-clamp-2">
            {app.description}
          </p>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
