import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import AdminActions from "@/components/AdminActions";

export const dynamic = "force-dynamic";

interface AppData {
  id: string;
  title: string;
  description: string;
  version: string;
  fileUrl: string;
  iconUrl?: string;
  requireLogin: boolean;
  createdAt: any;
}

export default async function AppsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  let isAdmin = false;
  let isStaff = false;

  if (session && session !== "guest_session") {
    isStaff = true;
    try {
      const userDoc = await adminDb.collection("users").doc(session).get();
      if (userDoc.exists && userDoc.id === "sungjee90") isAdmin = true;
    } catch (error) {
      console.error("유저 권한 확인 에러:", error);
    }
  }

  const snapshot = await adminDb
    .collection("apps")
    .orderBy("createdAt", "desc")
    .get();
  const allApps: AppData[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AppData, "id">),
  }));

  const freeApps = allApps.filter((app) => !app.requireLogin);
  const staffApps = allApps.filter((app) => app.requireLogin);

  return (
    <>
      {/* ============================ MOBILE ============================ */}
      <div className="md:hidden bg-white min-h-screen">
        <div className="px-5 pt-6 pb-3">
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight">
            앱 보관함
          </h1>
          <p className="text-sm text-gray-500 font-semibold mt-0.5">
            업무용 앱을 모아봤어요
          </p>
          {isAdmin && (
            <Link
              href={"/admin/upload" as any}
              className="inline-flex items-center gap-1.5 mt-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              새 앱 등록
            </Link>
          )}
        </div>

        {/* Free */}
        <section className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-extrabold text-gray-900">
              누구나 받을 수 있어요
            </h2>
            <span className="text-[11px] font-extrabold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {freeApps.length}
            </span>
          </div>
          {freeApps.length > 0 ? (
            <div className="space-y-2">
              {freeApps.map((app) => (
                <AppCardMobile
                  key={app.id}
                  app={app}
                  isAdmin={isAdmin}
                  variant="free"
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl py-10 text-center text-sm text-gray-400 font-bold">
              준비된 공개 앱이 없습니다.
            </div>
          )}
        </section>

        {/* Staff */}
        <section className="px-5 pt-5 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-extrabold text-gray-900">
              사내 직원만 받을 수 있어요
            </h2>
            <span className="text-[11px] font-extrabold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {staffApps.length}
            </span>
          </div>

          {isStaff ? (
            staffApps.length > 0 ? (
              <div className="space-y-2">
                {staffApps.map((app) => (
                  <AppCardMobile
                    key={app.id}
                    app={app}
                    isAdmin={isAdmin}
                    variant="staff"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl py-10 text-center text-sm text-gray-400 font-bold">
                등록된 사내 전용 앱이 없습니다.
              </div>
            )
          ) : (
            <div className="bg-gray-50 rounded-3xl p-6 flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-2">
                  로그인이 필요해요
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  사내 전용 앱은 STAFF 인증을 거친 직원만 받을 수 있어요.
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-blue-600 active:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm"
                >
                  로그인하러 가기
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ============================ DESKTOP (기존) ============================ */}
      <div className="hidden md:block max-w-5xl mx-auto py-12 px-6 space-y-12">
        <div className="text-center space-y-3 relative">
          <h1 className="text-5xl font-black text-gray-950 tracking-tighter">
            앱 <span className="text-blue-600">보관함</span> 📦
          </h1>
          <p className="text-lg text-gray-400 font-bold">
            칙칙톡톡 공식 애플리케이션 저장소
          </p>
          {isAdmin && (
            <div className="pt-4 animate-fade-in">
              <a
                href="/admin/upload"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-sm"
              >
                ⚙️ 관리자 전용: 새 앱 등록하기
              </a>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 hover:border-blue-500 transition-colors duration-500 group min-h-[400px]">
            <div className="border-b border-gray-50 pb-6 mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase italic">
                Free Download
              </h2>
            </div>
            <div className="space-y-4">
              {freeApps.length > 0 ? (
                freeApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-xl hover:bg-white transition-all group/item relative"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <Link
                        href={`/apps/${app.id}` as any}
                        className="flex items-center gap-4 flex-1 min-w-0"
                      >
                        <div className="w-16 h-16 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                          {app.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.iconUrl}
                              alt={app.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">📱</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-gray-900 text-lg leading-tight truncate">
                            {app.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-bold mt-0.5 mb-1.5 truncate">
                            {app.description}
                          </p>
                          <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md font-black">
                            v{app.version}
                          </span>
                        </div>
                      </Link>
                      <a
                        href={app.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 z-10"
                      >
                        받기
                      </a>
                    </div>
                    {isAdmin && (
                      <div className="mt-3 pt-3 border-t border-gray-200/70 flex justify-end relative z-10">
                        <AdminActions
                          appId={app.id}
                          currentTitle={app.title}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-20 text-gray-300 font-bold italic">
                  준비된 공개 앱이 없습니다.
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-950 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
            <div className="border-b border-gray-800 pb-6 mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
                Staff Only 🔒
              </h2>
            </div>
            <div className="space-y-4">
              {isStaff ? (
                staffApps.length > 0 ? (
                  staffApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col p-5 bg-gray-900/50 rounded-3xl border border-gray-800 hover:bg-gray-900 transition-all"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <Link
                          href={`/apps/${app.id}` as any}
                          className="flex items-center gap-4 flex-1 min-w-0"
                        >
                          <div className="w-16 h-16 shrink-0 bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center overflow-hidden">
                            {app.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={app.iconUrl}
                                alt={app.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl">🛡️</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-white text-lg leading-tight truncate">
                              {app.title}
                            </h3>
                            <p className="text-xs text-gray-400 font-bold mt-0.5 mb-1.5 truncate">
                              {app.description}
                            </p>
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-md font-black">
                              v{app.version}
                            </span>
                          </div>
                        </Link>
                        <a
                          href={app.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95"
                        >
                          받기
                        </a>
                      </div>
                      {isAdmin && (
                        <div className="mt-3 pt-3 border-t border-gray-800 flex justify-end">
                          <AdminActions
                            appId={app.id}
                            currentTitle={app.title}
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-20 text-gray-600 font-bold italic">
                    등록된 사내 전용 앱이 없습니다.
                  </p>
                )
              ) : (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                  <p className="text-sm text-gray-500 font-black mb-6 leading-relaxed">
                    사내 전용 앱은
                    <br />
                    로그인 후 이용할 수 있습니다.
                  </p>
                  <a
                    href="/login"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all active:scale-95"
                  >
                    로그인하러 가기 🚄
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AppCardMobile({
  app,
  isAdmin,
  variant,
}: {
  app: AppData;
  isAdmin: boolean;
  variant: "free" | "staff";
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/apps/${app.id}` as any}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-12 h-12 shrink-0 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            {app.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={app.iconUrl}
                alt={app.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate">
              {app.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-extrabold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                v{app.version}
              </span>
              {variant === "staff" && (
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  STAFF
                </span>
              )}
            </div>
          </div>
        </Link>
        <a
          href={app.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-gray-900 active:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
        >
          받기
        </a>
      </div>
      {app.description && (
        <p className="text-xs text-gray-500 font-medium mt-2 line-clamp-1 leading-snug">
          {app.description}
        </p>
      )}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
          <AdminActions appId={app.id} currentTitle={app.title} />
        </div>
      )}
    </div>
  );
}
