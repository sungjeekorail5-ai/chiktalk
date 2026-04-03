import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import AdminActions from "@/components/AdminActions";

// 💡 [캐시 방지] 매번 서버에서 최신 앱 목록과 로그인 상태를 확인하도록 강제합니다.
export const dynamic = "force-dynamic";

interface AppData {
  id: string;
  title: string;
  description: string;
  version: string;
  fileUrl: string;
  iconUrl?: string;
  requireLogin: boolean;
  createdAt: string;
}

export default async function AppsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  // 👑 [왕의 징표] 성지님의 Firestore 문서 ID를 여기에 넣으세요!
  // 아까 찾으신 sungjee90 데이터의 그 긴 문서 ID 문자열을 넣으면 됩니다.
  const ADMIN_SESSION_ID = "여기에_성지님_문서_ID_복붙"; 

  // 1. 성지님 본인만 관리자 권한 (버튼 노출용)
  const isAdmin = session === ADMIN_SESSION_ID;
  
  // 2. 코레일 직원 전체 권한 (스태프 전용 앱 접근용)
  const isStaff = !!session && session !== "guest_session";

  const snapshot = await adminDb.collection("apps").orderBy("createdAt", "desc").get();
  const allApps: AppData[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<AppData, 'id'>)
  }));

  const freeApps = allApps.filter(app => !app.requireLogin);
  const staffApps = allApps.filter(app => app.requireLogin);

  return (
    <div className="max-w-5xl mx-auto py-10 sm:py-12 px-4 sm:px-6 space-y-10 sm:space-y-12">
      
      {/* 📣 헤더 영역 */}
      <div className="text-center space-y-3 relative">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tighter">
          앱 <span className="text-blue-600">보관함</span> 📦
        </h1>
        <p className="text-base sm:text-lg text-gray-400 font-bold">
          칙칙톡톡 공식 애플리케이션 저장소
        </p>

        {/* 🚀 오직 성지님(ADMIN)에게만 보이는 새 앱 등록 버튼 */}
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

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
        
        {/* 🟢 1. Free Download (누구나 가능) */}
        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 sm:p-8 hover:border-blue-500 transition-colors duration-500 group min-h-[400px]">
          <div className="border-b border-gray-50 pb-5 sm:pb-6 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase italic">
              Free Download
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-bold mt-1.5 sm:mt-2">
              누구나 자유롭게 받을 수 있는 공개 앱
            </p>
          </div>

          <div className="space-y-4">
            {freeApps.length > 0 ? (
              freeApps.map((app) => (
                <div key={app.id} className="flex flex-col p-4 sm:p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-xl hover:bg-white transition-all group/item">
                  
                  <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover/item:scale-105 transition-transform">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt={app.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📱</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-black text-gray-900 text-base sm:text-lg leading-tight truncate">{app.title}</h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-bold mt-0.5 mb-1.5 truncate">{app.description}</p>
                      <div>
                        <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md font-black">v{app.version}</span>
                      </div>
                    </div>
                    
                    <a 
                      href={app.fileUrl} 
                      className="shrink-0 bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95"
                    >
                      받기
                    </a>
                  </div>

                  {/* 🚀 관리자 전용 수정/삭제 (성지님만 보임) */}
                  {isAdmin && (
                    <div className="mt-3 pt-3 border-t border-gray-200/70 flex justify-end">
                      <AdminActions appId={app.id} currentTitle={app.title} />
                    </div>
                  )}

                </div>
              ))
            ) : (
              <p className="text-center py-20 text-gray-300 font-bold italic">준비된 공개 앱이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 🔴 2. Staff Only (직원 전용) */}
        <div className="bg-gray-950 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group min-h-[400px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-colors"></div>

          <div className="border-b border-gray-800 pb-5 sm:pb-6 mb-6 sm:mb-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3 group-hover:text-blue-400 transition-colors uppercase italic">
              Staff Only <span className="text-lg sm:text-xl">🔒</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-bold mt-1.5 sm:mt-2">
              사내메일 인증 회원 한정 공개 앱
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {isStaff ? (
              staffApps.length > 0 ? (
                staffApps.map((app) => (
                  <div key={app.id} className="flex flex-col p-4 sm:p-5 bg-gray-900/50 rounded-3xl border border-gray-800 hover:border-blue-900 hover:bg-gray-900 transition-all group/item">
                    
                    <div className="flex items-center gap-3 sm:gap-4 w-full">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover/item:scale-105 transition-transform">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt={app.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🛡️</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-black text-white text-base sm:text-lg leading-tight truncate">{app.title}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-400 font-bold mt-0.5 mb-1.5 truncate">{app.description}</p>
                        <div>
                          <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-md font-black">v{app.version}</span>
                        </div>
                      </div>

                      <a 
                        href={app.fileUrl} 
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                      >
                        받기
                      </a>
                    </div>

                    {/* 🚀 관리자 전용 수정/삭제 (성지님만 보임) */}
                    {isAdmin && (
                      <div className="mt-3 pt-3 border-t border-gray-800 flex justify-end">
                        <AdminActions appId={app.id} currentTitle={app.title} />
                      </div>
                    )}

                  </div>
                ))
              ) : (
                <p className="text-center py-20 text-gray-600 font-bold italic">등록된 사내 전용 앱이 없습니다.</p>
              )
            ) : (
              <div className="text-center py-16 sm:py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                <p className="text-xs sm:text-sm text-gray-500 font-black mb-5 sm:mb-6 leading-relaxed">사내 전용 앱은<br/>로그인 후 이용할 수 있습니다.</p>
                <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95">
                  로그인하러 가기 🚄
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}