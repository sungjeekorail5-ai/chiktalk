"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditClient({ appId, initialData }: { appId: string, initialData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  // 💡 [추가] 상세 설명 상태 추가
  const [detailedDescription, setDetailedDescription] = useState(initialData.detailedDescription || ""); 
  const [version, setVersion] = useState(initialData.version);
  const [requireLogin, setRequireLogin] = useState(initialData.requireLogin);

  const handleUpdate = async () => {
    setIsLoading(true);
    
    // API 라우트로 업데이트 요청
    const res = await fetch(`/api/admin/apps/${appId}`, {
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      // 💡 [추가] detailedDescription 같이 넘겨주기!
      body: JSON.stringify({ title, description, detailedDescription, version, requireLogin }),
    });

    if (res.ok) {
      alert("앱 수정이 완료되었습니다.");
      router.refresh();
      router.push("/apps"); // 수정 완료 후 이동할 페이지
    } else {
      alert("수정 실패 ㅠㅠ");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">앱 이름</label>
        <input 
          className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">한줄 설명</label>
        <textarea 
          className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white h-20" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </div>

      {/* 💡 [추가] 상세 설명 (긴 글) 수정 칸 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">상세 설명 (Detailed Description)</label>
        <textarea 
          className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white h-40 resize-none" 
          value={detailedDescription} 
          onChange={(e) => setDetailedDescription(e.target.value)} 
          placeholder="앱에 대한 자세한 설명이나 업데이트 내용을 적어주세요."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">버전</label>
        <input 
          className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white" 
          value={version} 
          onChange={(e) => setVersion(e.target.value)} 
        />
      </div>

      <label className="flex items-center gap-3 text-white">
        <input 
          type="checkbox" 
          className="w-5 h-5"
          checked={requireLogin} 
          onChange={(e) => setRequireLogin(e.target.checked)} 
        />
        로그인 필요 (STAFF ONLY)
      </label>

      <button 
        onClick={handleUpdate} 
        disabled={isLoading}
        className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-lg transition-all"
      >
        {isLoading ? "수정 중..." : "수정 완료"}
      </button>
    </div>
  );
}