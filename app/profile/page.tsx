"use client";

import { useRouter } from "next/navigation";
// import { useAuth } from "../../lib/AuthContext"; // 💡 나중에 실제 로그인 정보 가져올 때 주석 해제하세요!

export default function ProfilePage() {
  const router = useRouter();

  // 💡 임시 로그아웃 함수 (나중에 실제 로그아웃 API를 연결하면 됩니다)
  const handleLogout = async () => {
    if (confirm("정말 하차(로그아웃) 하시겠습니까? 🥺")) {
      // 여기에 실제 로그아웃 API 호출 로직 추가 (예: await fetch('/api/auth/logout', { method: 'POST' }); )
      alert("로그아웃 되었습니다. 안녕히 가세요! 👋");
      router.push("/");
      // 상태 초기화를 위해 새로고침이 필요할 수도 있습니다.
      // window.location.reload(); 
    }
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

      {/* 2️⃣ 프로필 카드 (승차권 컨셉) */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5 sm:gap-6 relative overflow-hidden">
        {/* 장식용 기차 배경 마크 */}
        <div className="absolute -right-6 -top-6 text-9xl opacity-[0.03] pointer-events-none">
          🚄
        </div>

        {/* 아바타 */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0 shadow-inner">
          🧑‍✈️
        </div>
        
        {/* 유저 정보 (텍스트 잘림 방지 적용) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* 💡 나중에 실제 DB에서 가져온 닉네임을 여기에 넣습니다 */}
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate">칙칙폭폭승객</h2>
            <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0">
              일반회원
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {/* 💡 실제 이메일 연동 자리 */}
            chikchiktalktalk@gmail.com
          </p>
        </div>
      </div>

      {/* 3️⃣ 설정 및 메뉴 리스트 */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50 transition-colors active:bg-gray-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xl sm:text-2xl bg-gray-50 p-2 rounded-xl">📝</span>
            <span className="font-bold text-sm sm:text-base text-gray-700">내가 쓴 글 보기</span>
          </div>
          <span className="text-gray-300 font-bold">❯</span>
        </button>
        
        <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50 transition-colors active:bg-gray-100">
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