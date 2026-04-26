"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EditClientProps {
  postId: string;
  initialTitle: string;
  initialContent: string;
}

export default function EditClient({
  postId,
  initialTitle,
  initialContent,
}: EditClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim())
      return alert("제목과 내용을 모두 입력해주세요!");
    setIsLoading(true);

    const res = await fetch(`/api/board/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      router.push(`/board/${postId}` as any);
      router.refresh();
    } else {
      alert("수정에 실패했습니다.");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 상단 네비 */}
      <div className="md:hidden flex items-center justify-between px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href={`/board/${postId}` as any}
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">취소</span>
        </Link>
        <button
          form="edit-form"
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition-transform"
        >
          {isLoading ? "저장중..." : "저장"}
        </button>
      </div>

      <form
        id="edit-form"
        onSubmit={handleUpdate}
        className="max-w-2xl mx-auto px-5 md:px-0 py-5 md:py-0 space-y-5 md:space-y-6"
      >
        {/* PC 제목 */}
        <h2 className="hidden md:block text-2xl font-black text-gray-900 tracking-tight">
          ✏️ 게시글 수정
        </h2>

        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-gray-700">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold text-[15px] transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-gray-700">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium text-[15px] leading-relaxed resize-none transition-all min-h-[320px]"
            required
          />
        </div>

        {/* PC 버튼 */}
        <div className="hidden md:flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold rounded-xl transition-all active:scale-95"
          >
            {isLoading ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
