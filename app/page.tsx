import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("session");

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 sm:px-6 relative overflow-hidden">
      
      {/* 🚄 메인 로고 및 타이틀 섹션 */}
      <div className="relative mb-6 group flex flex-col items-center w-full">
        
        {/* 장식용 기차 궤적 애니메이션 */}
        <div className="flex justify-center w-full mb-6 sm:mb-10 group-hover:animate-drift scale-75 sm:scale-100 transition-transform">
          <div className="w-12 sm:w-16 h-1 bg-gray-100 rounded-full mx-1"></div>
          <div className="w-20 sm:w-28 h-1.5 bg-blue-500 rounded-full mx-1 shadow-2xl shadow-blue-200"></div>
          
          <div className="relative">
            <div className="w-32 sm:w-48 h-2 bg-blue-600 rounded-full mx-1 shadow-lg shadow-blue-100"></div>
            <div className="absolute -left-10 top-0 w-24 sm:w-32 h-1 bg-gradient-to-l from-blue-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-700 blur-sm"></div>
            <div className="absolute -left-20 top-0 w-32 sm:w-48 h-1 bg-gradient-to-l from-blue-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-1000 blur-md"></div>
          </div>
        </div>
        
        {/* 메인 타이틀 */}
        <div className="flex items-center justify-center group-hover:animate-drift transition-all">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none mb-4 sm:mb-8 flex items-center justify-center">
            <span className="text-gray-950">칙칙</span><span className="text-blue-600 font-extrabold">톡톡</span>
            <span className="ml-2 sm:ml-4 text-4xl sm:text-6xl md:text-8xl opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
              🚄
            </span>
          </h1>
        </div>
        
        {/* 💡 성지님이 수정한 힙한 문구! */}
        <p className="text-base sm:text-xl md:text-3xl text-gray-400 font-black tracking-tight mt-2 sm:mt-6">
          CHIKCHIK <span className="text-gray-900 break-keep">TALK & APP</span>
        </p>
      </div>

      {/* 🚀 액션 버튼 섹션 */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full max-w-[90%] sm:max-w-lg mt-8 sm:mt-12">
        {isLoggedIn ? (
          <>
            <a 
              href="/apps" 
              className="flex-1 bg-gray-950 hover:bg-blue-600 text-white font-black py-4 sm:py-6 rounded-[2rem] shadow-2xl transition-all hover:-translate-y-2 active:scale-95 text-lg sm:text-xl flex items-center justify-center gap-2"
            >
              📦 앱 보관함
            </a>
            <a 
              href="/board" 
              className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-900 font-black py-4 sm:py-6 rounded-[2rem] shadow-sm transition-all hover:-translate-y-2 active:scale-95 text-lg sm:text-xl flex items-center justify-center gap-2"
            >
              💬 자유게시판
            </a>
          </>
        ) : (
          <a 
            href="/login" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 sm:py-7 rounded-full shadow-2xl shadow-blue-100 transition-all hover:-translate-y-2 active:scale-95 text-xl sm:text-2xl flex items-center justify-center gap-2 sm:gap-4"
          >
            열차 탑승하기 🚄💨
          </a>
        )}
      </div>

      {/* ⚙️ 관리자 숏컷 (숨김 모드) */}
      {isLoggedIn && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 opacity-30 hover:opacity-100 transition-opacity z-10">
          <a href="/admin/upload" className="text-gray-400 text-[10px] sm:text-xs font-bold px-3 py-2 hover:text-blue-600 hover:bg-blue-50 rounded-full bg-white/50 backdrop-blur-sm">
            ⚙️ 관리자 페이지 가기 →
          </a>
        </div>
      )}
    </div>
  );
}