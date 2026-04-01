"use client";

import { useRouter } from "next/navigation";

export default function AdminActions({ appId, currentTitle }: { appId: string, currentTitle: string }) {
  const router = useRouter();

  const onDelete = async () => {
    if (!confirm(`'${currentTitle}' 앱을 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/admin/apps/${appId}`, { method: "DELETE" });
    if (res.ok) {
      alert("삭제되었습니다.");
      router.refresh(); 
    } else {
      alert("삭제 실패 ㅠㅠ");
    }
  };

  const onEdit = () => {
    router.push(`/admin/edit/${appId}`);
  };

  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
      <button 
        onClick={onEdit}
        className="text-[10px] font-black text-gray-400 hover:text-blue-400 px-3 py-1 rounded-lg border border-gray-800 hover:border-blue-900 transition-all"
      >
        📝 수정
      </button>
      <button 
        onClick={onDelete}
        className="text-[10px] font-black text-gray-400 hover:text-red-400 px-3 py-1 rounded-lg border border-gray-800 hover:border-red-900 transition-all"
      >
        🗑️ 삭제
      </button>
    </div>
  );
}