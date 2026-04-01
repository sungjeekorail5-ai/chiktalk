import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import AdminActions from "@/components/AdminActions"; // 💡 새로 만든 관리자 액션 버튼 불러오기!

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

  const isStaff = !!session && session !== "guest_session";

  const snapshot = await adminDb.collection("apps").orderBy("createdAt", "desc").get();
  const allApps: AppData[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<AppData, 'id'>)
  }));

  const freeApps = allApps.filter(app => !app.requireLogin);
  const staffApps = allApps.filter(app => app.requireLogin);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      
      {/* 📣 헤더 영역 */}
      <div className="text-center space-y-3 relative">
        <h1 className="text-5xl font-black text-gray-950 tracking-tighter">
          앱 <span className="text-blue-600">보관함</span> 📦
        </h1>
        <p className="text-lg text-gray-400 font-bold">
          칙칙톡톡 공식 애플리케이션 저장소
        </p>

        {isStaff && (
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
        
        {/* 🟢 1. Free Download (누구나 가능) */}
        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 hover:border-blue-500 transition-colors duration-500 group min-h-[400px]">
          <div className="border-b border-gray-50 pb-6 mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase italic">
              Free Download
            </h2>
            <p className="text-sm text-gray-400 font-bold mt-2">
              누구나 자유롭게 받을 수 있는 공개 앱
            </p>
          </div>

          <div className="space-y-4">
            {freeApps.length > 0 ? (
              freeApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-xl hover:bg-white transition-all group/item">
                  
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover/item:scale-110 transition-transform mt-1">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt={app.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📱</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col items-start">
                      <h3 className="font-black text-gray-900 text-lg leading-tight break-keep">{app.title}</h3>
                      <p className="text-[12px] text-gray-500 font-bold mt-1.5 mb-2 break-keep leading-snug">{app.description}</p>
                      
                      <div className="flex flex-col gap-2 w-full">
                        <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full font-black w-max">v{app.version}</span>
                        {/* 💡 관리자용 수정/삭제 버튼 노출 (공개 앱) */}
                        {isStaff && <AdminActions appId={app.id} currentTitle={app.title} />}
                      </div>
                    </div>
                  </div>
                  
                  <a 
                    href={app.fileUrl} 
                    className="shrink-0 whitespace-nowrap ml-4 bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-90"
                  >
                    받기
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center py-20 text-gray-300 font-bold italic">준비된 공개 앱이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 🔴 2. Staff Only (직원 전용) */}
        <div className="bg-gray-950 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group min-h-[400px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-colors"></div>

          <div className="border-b border-gray-800 pb-6 mb-8 relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 group-hover:text-blue-400 transition-colors uppercase italic">
              Staff Only <span className="text-xl">🔒</span>
            </h2>
            <p className="text-sm text-gray-400 font-bold mt-2">
              사내메일 인증 회원 한정 공개 앱
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {isStaff ? (
              staffApps.length > 0 ? (
                staffApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-5 bg-gray-900/50 rounded-3xl border border-gray-800 hover:border-blue-900 hover:bg-gray-900 transition-all group/item">
                    
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 shrink-0 bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover/item:scale-110 transition-transform mt-1">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt={app.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🛡️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col items-start">
                        <h3 className="font-black text-white text-lg leading-tight break-keep">{app.title}</h3>
                        <p className="text-[12px] text-gray-400 font-bold mt-1.5 mb-2 break-keep leading-snug">{app.description}</p>
                        
                        <div className="flex flex-col gap-2 w-full">
                          <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full font-black w-max">v{app.version}</span>
                          {/* 💡 관리자용 수정/삭제 버튼 노출 (사내 전용 앱) */}
                          {isStaff && <AdminActions appId={app.id} currentTitle={app.title} />}
                        </div>
                      </div>
                    </div>

                    <a 
                      href={app.fileUrl} 
                      className="shrink-0 whitespace-nowrap ml-4 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-90 shadow-lg shadow-blue-900/40"
                    >
                      받기
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-center py-20 text-gray-600 font-bold italic">등록된 사내 전용 앱이 없습니다.</p>
              )
            ) : (
              <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                <p className="text-sm text-gray-500 font-black mb-6">사내 전용 앱은<br/>로그인 후 이용할 수 있습니다.</p>
                <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all active:scale-95">
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