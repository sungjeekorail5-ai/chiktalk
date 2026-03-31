import Link from "next/link";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("session");

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
      
      {/* 🚄 [Main Visual Section] */}
      <div className="relative mb-6 group flex flex-col items-center">
        
        {/* 기차 그래픽 */}
        <div className="flex justify-center w-full mb-10 group-hover:animate-drift">
          <div className="w-16 h-1 bg-gray-100 rounded-full mx-1"></div>
          <div className="w-28 h-1.5 bg-blue-500 rounded-full mx-1 shadow-2xl shadow-blue-200"></div>
          
          <div className="relative">
            <div className="w-48 h-2 bg-blue-600 rounded-full mx-1 shadow-lg shadow-blue-100"></div>
            <div className="absolute -left-10 top-0 w-32 h-1 bg-gradient-to-l from-blue-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-700 blur-sm"></div>
            <div className="absolute -left-20 top-0 w-48 h-1 bg-gradient-to-l from-blue-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-1000 blur-md"></div>
          </div>
        </div>
        
        {/* ✍️ Main Title */}
        <div className="flex items-start justify-center group-hover:animate-drift transition-all">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-8">
            <span className="text-gray-950">칙칙</span><span className="text-blue-600 font-extrabold">톡톡</span>
          </h1>
          {/* 타이틀 옆 기차 (연기 💨는 위쪽 로고로 이동시켰음) */}
          <span className="relative text-7xl md:text-9xl -mt-16 ml-2 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-1 left-0 text-[1em]">🚄</span>
          </span>
        </div>
        
        {/* Subtitle */}
        <p className="text-xl md:text-3xl text-gray-400 font-black tracking-tight mt-6">
          대한민국 철도인 <span className="text-gray-900">TALK & APP</span>
        </p>
        
        {/* 💡 CHIKCHIK TALK PRIVATE ARCHIVE 문구 삭제 완료! */}
      </div>

      {/* 🕹️ Center Stacked Buttons (💡 문구가 사라진 만큼 mt-12로 위로 끌어올림) */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg mt-12">
        {isLoggedIn ? (
          <>
            <Link 
              href="/apps" 
              className="flex-1 bg-gray-950 hover:bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all hover:-translate-y-2 active:scale-95 text-xl flex items-center justify-center gap-2"
            >
              📦 앱 보관함
            </Link>
            <Link 
              href="/board" 
              className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-900 font-black py-6 rounded-[2rem] shadow-sm transition-all hover:-translate-y-2 active:scale-95 text-xl flex items-center justify-center gap-2"
            >
              💬 자유게시판
            </Link>
          </>
        ) : (
          <Link 
            href="/login" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-blue-100 transition-all hover:-translate-y-2 active:scale-95 text-2xl flex items-center justify-center gap-4"
          >
            열차 탑승하기 🚄💨
          </Link>
        )}
      </div>

      {/* ⚙️ 관리자 링크 */}
      {isLoggedIn && (
        <div className="absolute bottom-6 right-6 opacity-30 hover:opacity-100 transition-opacity">
          <Link href="/admin/upload" className="text-gray-300 text-xs font-bold px-4 py-2 hover:text-blue-600 hover:bg-blue-50 rounded-full">
            ⚙️ 기관사 센터 가기 →
          </Link>
        </div>
      )}
    </div>
  );
}