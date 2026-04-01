"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext"; 
import Link from "next/link"; 

// 🛠️ 게시글 수정/삭제 버튼 (기존과 동일)
export function PostActionButtons({ postId, authorId }: { postId: string, authorId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const ADMIN_ID = "sungjee90"; 

  const hasPermission = user && (user.id === authorId || user.id === ADMIN_ID);
  if (!hasPermission) return null;

  const handleDelete = async () => {
    if (!confirm("진짜로 이 글을 삭제하시겠습니까? 훅 날아갑니다!")) return;
    const res = await fetch(`/api/board/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/board");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Link href={`/board/edit/${postId}` as any} className="text-sm text-blue-500 hover:text-blue-700 font-bold transition-colors">
        ✏️ 수정
      </Link>
      <button onClick={handleDelete} className="text-sm text-gray-400 hover:text-red-500 font-bold transition-colors">
        🗑️ 삭제
      </button>
    </div>
  );
}

// 💬 댓글 전체 영역
export function CommentSection({ postId, comments }: { postId: string, comments: any[] }) {
  const router = useRouter();
  const { user } = useAuth(); 
  const ADMIN_ID = "sungjee90";
  
  const [replyTo, setReplyTo] = useState<string | null>(null); 
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 💡 댓글 수정을 위한 새로운 상태들!
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const topLevelComments = comments.filter(c => !c.parentId);

  // 📝 새 댓글 등록
  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user) return alert("로그인한 승객만 댓글을 달 수 있습니다! ⛔");
    if (!content.trim()) return alert("댓글 내용을 입력해주세요!");
    setIsLoading(true);

    const res = await fetch(`/api/board/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, nickname: user.nickname, content, parentId }),
    });

    if (res.ok) {
      setContent("");
      setReplyTo(null); 
      router.refresh(); 
    }
    setIsLoading(false);
  };

  // 🗑️ 댓글 삭제 함수 (4단계에서 백엔드 만들 예정)
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    const res = await fetch(`/api/board/${postId}/comment?commentId=${commentId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  // ✏️ 댓글 수정 함수 (4단계에서 백엔드 만들 예정)
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return alert("내용을 입력해주세요.");
    const res = await fetch(`/api/board/${postId}/comment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, content: editContent }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditContent("");
      router.refresh();
    }
  };

  // 💡 권한 체크 도우미 함수 (내 댓글인지 확인)
  const isOwnerOrAdmin = (authorId: string) => {
    return user && (user.id === authorId || user.id === ADMIN_ID);
  };

  const renderForm = (parentId: string | null = null) => {
    if (!user) {
      return (
        <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center text-gray-400 font-bold text-sm">
          로그인 후 따뜻한 댓글을 남길 수 있습니다. 🚂
        </div>
      );
    }
    return (
      <form onSubmit={(e) => handleSubmit(e, parentId)} className="mt-4 bg-gray-50 p-5 rounded-2xl flex flex-col gap-3 border border-gray-100">
        <div className="px-2 font-black text-blue-600 text-sm flex items-center gap-2">
          <span>🚄 {user.nickname}</span>
          {parentId && <span className="text-xs text-blue-400/70">(대댓글 작성)</span>}
        </div>
        <div className="flex gap-3">
          <input
            type="text" placeholder="따뜻한 댓글을 남겨주세요..." value={content} onChange={e => setContent(e.target.value)} required
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
          />
          <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black px-6 rounded-xl transition-all shadow-md active:scale-95">
            {isLoading ? "등록 중..." : "등록"}
          </button>
          {parentId && (
            <button type="button" onClick={() => { setReplyTo(null); setContent(""); }} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold rounded-xl text-sm transition-all">
              취소
            </button>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
      <h3 className="text-xl font-bold text-gray-900 mb-6">댓글 {comments.length}개</h3>

      <div className="space-y-6 mb-8">
        {topLevelComments.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
        ) : (
          topLevelComments.map((cmt) => (
            <div key={cmt.id} className="border-b border-gray-50 pb-5">
              
              {/* 1️⃣ 최상위 본댓글 헤더 (수정/삭제 버튼 추가) */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-sm">{cmt.authorNickname || cmt.author || "익명 승객"}</span>
                  <span suppressHydrationWarning className="text-xs text-gray-400">{new Date(cmt.createdAt).toLocaleString()}</span>
                </div>
                
                {/* 💡 내 댓글이면 수정/삭제 버튼 노출! */}
                {isOwnerOrAdmin(cmt.authorId) && (
                  <div className="flex gap-3 text-xs font-bold">
                    <button onClick={() => { setEditingId(cmt.id); setEditContent(cmt.content); }} className="text-blue-400 hover:text-blue-600">수정</button>
                    <button onClick={() => handleDeleteComment(cmt.id)} className="text-gray-300 hover:text-red-500">삭제</button>
                  </div>
                )}
              </div>

              {/* 💡 수정 모드일 때와 아닐 때 화면 다르게 보여주기 */}
              {editingId === cmt.id ? (
                <div className="flex gap-2 mb-2">
                  <input value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => handleUpdateComment(cmt.id)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">저장</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold">취소</button>
                </div>
              ) : (
                <p className="text-gray-700 mb-2">{cmt.content}</p>
              )}

              <button onClick={() => { setReplyTo(cmt.id); setContent(""); }} className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
                ↳ 답글 달기
              </button>

              {/* 2️⃣ 대댓글들 렌더링 */}
              <div className="mt-3 space-y-2">
                {comments
                  .filter(reply => reply.parentId === cmt.id)
                  .reverse()
                  .map(reply => (
                  <div key={reply.id} className="ml-6 pl-4 border-l-[3px] border-blue-100 bg-gray-50/50 p-3 rounded-r-xl">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs">🚄 {reply.authorNickname || reply.author || "익명 승객"}</span>
                        <span suppressHydrationWarning className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      
                      {/* 💡 대댓글에도 내 글이면 수정/삭제 버튼 노출! */}
                      {isOwnerOrAdmin(reply.authorId) && (
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button onClick={() => { setEditingId(reply.id); setEditContent(reply.content); }} className="text-blue-400 hover:text-blue-600">수정</button>
                          <button onClick={() => handleDeleteComment(reply.id)} className="text-gray-300 hover:text-red-500">삭제</button>
                        </div>
                      )}
                    </div>

                    {/* 💡 대댓글 수정 모드 */}
                    {editingId === reply.id ? (
                      <div className="flex gap-2 mt-2">
                        <input value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 px-2 py-1 border rounded-md text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => handleUpdateComment(reply.id)} className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs font-bold">저장</button>
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md text-xs font-bold">취소</button>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">{reply.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* 3️⃣ 이 댓글을 향한 대댓글 입력 폼 */}
              {replyTo === cmt.id && renderForm(cmt.id)}
            </div>
          ))
        )}
      </div>

      {/* 4️⃣ 페이지 맨 밑의 최상단 본댓글 작성 폼 */}
      {replyTo === null && renderForm(null)}
    </div>
  );
}