"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link"; 

export default function ProfilePage() {
  const router = useRouter();
  
  const { user, logout } = useAuth(); 

  const handleLogout = async () => {
    if (confirm("정말 하차(로그아웃) 하시겠습니까? 🥺")) {
      await logout(); 
      alert("로그아웃 되었습니다. 안녕히 가세요! 👋");
      router.push("/");
    }
  };

  const handleComingSoon = () => {
    alert("열심히 선로를 깔고 있는(공사 중인) 기능입니다! 🚧 조금만 기다려주세요!");
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* 1️⃣ 페이지 타이틀 */}
      <div className="mb-4 sm:mb-8 pl-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          내 정보 <span className="text-blue-600">🎫</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-bold mt-1">탑승객님의 승차권 정보입니다.</p>
      </div>

      {/* 2️⃣ 프로필 카드 */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5 sm:gap-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-9xl opacity-[0.03] pointer-events-none">
          🚄
        </div>

        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0 shadow-inner">
          🧑‍✈️
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate">
              {user ? user.nickname : "로딩 중..."}
            </h2>
            
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
              (user as any)?.email?.includes('@korail.com') ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {(user as any)?.email?.includes('@korail.com') ? 'STAFF' : 'GUEST'}
            </span>
          </div>
        </div>
      </div>

      {/* 3️⃣ 설정 및 메뉴 리스트 */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        
        {/* 🚀 [수정 완료] href에 {"/profile/posts" as any} 를 적용해서 에러를 껐습니다! */}
        <Link href={"/profile/posts" as any} className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50 transition-colors active:bg-gray-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xl sm:text-2xl bg-gray-50 p-2 rounded-xl">📝</span>
            <span className="font-bold text-sm sm:text-base text-gray-700">내가 쓴 글 보기</span>
          </div>
          <span className="text-gray-300 font-bold">❯</span>
        </Link>
        
        <button onClick={handleComingSoon} className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50 transition-colors active:bg-gray-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xl sm:text-2xl bg-gray-50 p-2 rounded-xl">🔒</span>
            <span className="font-bold text-sm sm:text-base text-gray-700">비밀번호 변경</span>
          </div>
          <span className="text-gray-300 font-bold">❯</span>
        </button>
      </div>

      {/* 4️⃣ 로그아웃 버튼 */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-4 sm:py-5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 font-black rounded-[1.5rem] transition-colors active:scale-95 text-sm sm:text-base"
        >
          로그아웃 (열차 하차하기)
        </button>
      </div>

    </div>
  );
}