"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 🗑️ 삭제 버튼 컴포넌트
export function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("진짜로 이 글을 삭제하시겠습니까? 훅 날아갑니다!")) return;

    const res = await fetch(`/api/board/${postId}`, { method: "DELETE" });
    if (res.ok) {
      alert("삭제되었습니다. 펑! 💥");
      router.push("/board");
      router.refresh();
    }
  };

  return (
    <button onClick={handleDelete} className="text-sm text-gray-400 hover:text-red-500 font-bold transition-colors">
      🗑️ 삭제
    </button>
  );
}

// 💬 댓글 작성 폼 컴포넌트
export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return alert("이름이랑 내용을 다 적어주세요!");
    setIsLoading(true);

    const res = await fetch(`/api/board/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    });

    if (res.ok) {
      setAuthor("");
      setContent("");
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-gray-50 p-6 rounded-2xl flex flex-col gap-4 border border-gray-100">
      <input
        type="text" placeholder="작성자" value={author} onChange={e => setAuthor(e.target.value)} required
        className="w-1/3 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-4">
        <input
          type="text" placeholder="따뜻한 댓글을 남겨주세요..." value={content} onChange={e => setContent(e.target.value)} required
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold px-8 rounded-xl transition-all shadow-md shadow-blue-100">
          {isLoading ? "등록중..." : "등록"}
        </button>
      </div>
    </form>
  );
}