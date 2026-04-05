import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AppDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. 파이어베이스에서 앱 데이터 가져오기
  const doc = await adminDb.collection("apps").doc(id).get();
  
  if (!doc.exists) return notFound();

  const appData = doc.data();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      
      {/* 1️⃣ 상단 헤더 영역 (아이콘, 제목, 짧은 설명, 다운로드 버튼) */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        {appData?.iconUrl ? (
          <img src={appData.iconUrl} alt="App Icon" className="w-32 h-32 rounded-3xl shadow-md object-cover border border-gray-50" />
        ) : (
          <div className="w-32 h-32 rounded-3xl bg-gray-100 flex items-center justify-center text-4xl shadow-md">
            📱
          </div>
        )}
        
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900">{appData?.title}</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full w-fit mx-auto md:mx-0">
              v{appData?.version || "1.0.0"}
            </span>
            {appData?.requireLogin && (
              <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full w-fit mx-auto md:mx-0">
                🔒 STAFF ONLY
              </span>
            )}
          </div>
          <p className="text-gray-500 font-medium text-lg">{appData?.description}</p>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-3 mt-4 md:mt-0">
          <a 
            href={appData?.fileUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            📥 다운로드
          </a>
          <Link href="/apps" className="text-center text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors">
            목록으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 2️⃣ 스크린샷 영역 (가로 스크롤) */}
      {appData?.screenshotUrls && appData.screenshotUrls.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 px-2">스크린샷 미리보기</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x custom-scrollbar">
            {appData.screenshotUrls.map((url: string, index: number) => (
              <div key={index} className="flex-shrink-0 w-48 md:w-64 snap-center">
                <img 
                  src={url} 
                  alt={`Screenshot ${index + 1}`} 
                  className="w-full h-auto rounded-2xl shadow-sm border border-gray-200 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3️⃣ 상세 설명 영역 (긴 글) */}
      {appData?.detailedDescription && (
        <div className="space-y-4 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
          <h2 className="text-xl font-black text-gray-900">앱 상세 정보</h2>
          {/* whitespace-pre-wrap을 넣어서 사용자가 엔터(줄바꿈) 친 게 그대로 화면에 나옵니다 */}
          <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">
            {appData.detailedDescription}
          </p>
        </div>
      )}

    </div>
  );
}