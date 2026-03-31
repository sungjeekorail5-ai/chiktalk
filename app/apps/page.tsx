import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";

// 📝 앱 데이터 타입 정의
interface AppData {
  id: string;
  title: string;
  description: string;
  version: string;
  fileUrl: string;
  requireLogin: boolean;
  createdAt: string;
}

export default async function AppsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  // 💡 [성지님 천재 아이디어 적용!] 게스트가 아닌 로그인 유저는 무조건 Staff(직원)입니다!
  const isStaff = !!session && session !== "guest_session";

  // 1️⃣ 파이어베이스에서 등록된 모든 앱 가져오기 (최신순)
  const snapshot = await adminDb.collection("apps").orderBy("createdAt", "desc").get();
  const allApps: AppData[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<AppData, 'id'>)
  }));

  // 2️⃣ 카테고리별로 분류 (공개 앱 vs 사내 전용)
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

        {/* ⚙️ 관리자 전용 버튼: 직원(로그인 유저)에게만 보입니다! */}
        {isStaff && (
          <div className="pt-4 animate-fade-in">
            <Link 
              href="/admin/upload" 
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-sm"
            >
              ⚙️ 관리자 전용: 새 앱 등록하기
            </Link>
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
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover/item:scale-110 transition-transform">
                      📱
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{app.title}</h3>
                      <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase mb-1">{app.description}</p>
                      <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full font-black">v{app.version}</span>
                    </div>
                  </div>
                  <a 
                    href={app.fileUrl} 
                    className="bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-90"
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
            {/* 💡 [핵심] 직원이면 다 보여주고, 아니면 로그인 버튼만 보여줍니다! */}
            {isStaff ? (
              staffApps.length > 0 ? (
                staffApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-5 bg-gray-900/50 rounded-3xl border border-gray-800 hover:border-blue-900 hover:bg-gray-900 transition-all group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover/item:scale-110 transition-transform">
                        🛡️
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg">{app.title}</h3>
                        <p className="text-[11px] text-gray-500 font-bold tracking-widest uppercase mb-1">{app.description}</p>
                        <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full font-black">v{app.version}</span>
                      </div>
                    </div>
                    <a 
                      href={app.fileUrl} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-90 shadow-lg shadow-blue-900/40"
                    >
                      받기
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-center py-20 text-gray-600 font-bold italic">등록된 사내 전용 앱이 없습니다.</p>
              )
            ) : (
              // 💡 로그인이 안 된 사용자에게만 깔끔하게 로그인 유도
              <div className="text-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                <p className="text-sm text-gray-500 font-black mb-6">사내 전용 앱은<br/>로그인 후 이용할 수 있습니다.</p>
                <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all active:scale-95">
                  로그인하러 가기 🚄
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}