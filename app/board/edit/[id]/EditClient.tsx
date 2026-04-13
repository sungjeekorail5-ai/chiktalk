"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditClientProps {
  postId: string;
  initialTitle: string;
  initialContent: string;
}

export default function EditClient({ postId, initialTitle, initialContent }: EditClientProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 모두 입력해주세요!");
    setIsLoading(true);

    const res = await fetch(`/api/board/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }), 
    });

    if (res.ok) {
      // 💡 귀찮은 팝업창(alert) 제거 완료! 수정 끝나면 바로 원래 글로 스무스하게 돌아갑니다.
      router.push(`/board/${postId}`); 
      router.refresh();
    } else {
      alert("수정에 실패했습니다.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all resize-none leading-relaxed"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black rounded-xl transition-all shadow-md active:scale-95"
        >
          {isLoading ? "수정 중..." : "수정 완료"}
        </button>
      </div>
    </form>
  );
}