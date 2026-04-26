"use client";

import { useRouter } from "next/navigation";

export default function AdminActions({
  appId,
  currentTitle,
}: {
  appId: string;
  currentTitle: string;
}) {
  const router = useRouter();

  const onDelete = async () => {
    if (!confirm(`'${currentTitle}' 앱을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/apps/${appId}`, { method: "DELETE" });
    if (res.ok) {
      alert("삭제되었습니다.");
      router.refresh();
    } else {
      alert("삭제 실패");
    }
  };

  const onEdit = () => {
    router.push(`/admin/edit/${appId}` as any);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-[11px] font-bold text-gray-600 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 active:bg-gray-50 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
        수정
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1 text-[11px] font-bold text-red-500 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 active:bg-red-50 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        삭제
      </button>
    </div>
  );
}
