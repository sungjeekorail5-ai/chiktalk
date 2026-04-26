import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AppDetailPage({ params }: Props) {
  const { id } = await params;
  const doc = await adminDb.collection("apps").doc(id).get();
  if (!doc.exists) return notFound();

  const appData = doc.data();

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 백 네비 */}
      <div className="md:hidden flex items-center px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/apps"
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">목록</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-4 py-6 md:py-10 space-y-6 md:space-y-10">
        {/* 1. 헤더 */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8 md:bg-white md:p-8 md:rounded-[2.5rem] md:shadow-sm md:border md:border-gray-100">
          {appData?.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={appData.iconUrl}
              alt="App Icon"
              className="w-24 h-24 md:w-32 md:h-32 rounded-3xl shadow-md object-cover bg-gray-50"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gray-50 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
              </svg>
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-2 md:space-y-3">
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {appData?.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-extrabold rounded-md">
                v{appData?.version || "1.0.0"}
              </span>
              {appData?.requireLogin && (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-[11px] font-extrabold rounded-md">
                  STAFF ONLY
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-lg leading-relaxed">
              {appData?.description}
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-2 md:gap-3 mt-2 md:mt-0">
            <a
              href={appData?.fileUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 active:bg-blue-700 text-white font-extrabold py-3.5 md:py-4 px-8 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[15px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              다운로드
            </a>
          </div>
        </div>

        {/* 2. 스크린샷 */}
        {appData?.screenshotUrls && appData.screenshotUrls.length > 0 && (
          <section>
            <h2 className="text-base md:text-xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
              미리보기
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
              {appData.screenshotUrls.map((url: string, index: number) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-44 md:w-64 snap-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto rounded-2xl bg-gray-50 object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. 상세 설명 */}
        {appData?.detailedDescription && (
          <section className="bg-gray-50 p-5 md:p-8 rounded-3xl">
            <h2 className="text-base md:text-xl font-extrabold text-gray-900 tracking-tight mb-3">
              앱 정보
            </h2>
            <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap text-[14px] md:text-base">
              {appData.detailedDescription}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
