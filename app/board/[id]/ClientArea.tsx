"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext"; 
import Link from "next/link"; 

// 🛠️ 1. 게시글 수정/삭제 버튼 (기존 로직 그대로)
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
      <Link href={`/board/edit/${postId}` as any} className="text-xs md:text-sm text-blue-500 hover:text-blue-700 font-bold transition-colors">
        ✏️ 수정
      </Link>
      <button onClick={handleDelete} className="text-xs md:text-sm text-gray-400 hover:text-red-500 font-bold transition-colors">
        🗑️ 삭제
      </button>
    </div>
  );
}

// ❤️ 2. 좋아요 버튼 컴포넌트 (기존 로직 그대로)
export function LikeButton({ postId, initialLikes, likedUsers = [] }: { postId: string, initialLikes: number, likedUsers: string[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(user ? likedUsers.includes(user.id) : false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user) return alert("로그인한 승객만 좋아요를 누를 수 있습니다! 🚂");
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/board/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikes(prev => data.liked ? prev + 1 : prev - 1);
        router.refresh();
      }
    } catch (error) {
      console.error("좋아요 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 md:gap-3 px-6 md:px-10 py-2 md:py-3 rounded-full font-black transition-all shadow-sm active:scale-90 ${
        isLiked 
        ? "bg-red-50 text-red-500 border border-red-100" 
        : "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100"
      }`}
    >
      <span className="text-xl md:text-2xl">{isLiked ? "❤️" : "🤍"}</span>
      <span className="text-base md:text-lg">{likes}</span>
    </button>
  );
}

// 💬 3. 댓글 전체 영역 (블라인드 UI 탑재 + 모든 기존 로직 포함)
export function CommentSection({ postId, comments }: { postId: string, comments: any[] }) {
  const router = useRouter();
  const { user } = useAuth(); 
  const ADMIN_ID = "sungjee90";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 상태 관리 (원본 로직 모두 유지)
  const [replyTo, setReplyTo] = useState<{id: string, nickname: string} | null>(null); 
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // 하단바 확장 여부

  const topLevelComments = comments.filter(c => !c.parentId);

  // 댓글 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("로그인한 승객만 댓글을 달 수 있습니다! ⛔");
    if (!content.trim()) return;
    setIsLoading(true);

    const res = await fetch(`/api/board/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: user.id, 
        nickname: user.nickname, 
        content, 
        parentId: replyTo?.id || null 
      }),
    });

    if (res.ok) {
      setContent("");
      setReplyTo(null);
      setIsExpanded(false); 
      router.refresh(); 
    }
    setIsLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    const res = await fetch(`/api/board/${postId}/comment?commentId=${commentId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

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

  const isOwnerOrAdmin = (authorId: string) => {
    return user && (user.id === authorId || user.id === ADMIN_ID);
  };

  // 답글 버튼 클릭 시 하단바 활성화 및 타겟팅
  const handleReplyClick = (cmtId: string, nickname: string) => {
    if(!user) return alert("로그인이 필요합니다! 🚂");
    setReplyTo({ id: cmtId, nickname });
    setIsExpanded(true);
  };

  // 하단바 열릴 때 자동 포커스
  useEffect(() => {
    if (isExpanded) textareaRef.current?.focus();
  }, [isExpanded]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 mb-32">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">댓글 {comments.length}개</h3>

      {/* 댓글 목록 출력 영역 (성지님 원본 스타일 유지) */}
      <div className="space-y-6">
        {topLevelComments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
        ) : (
          topLevelComments.map((cmt) => (
            <div key={cmt.id} className="border-b border-gray-50 pb-5 last:border-0">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="font-bold text-gray-900 text-sm truncate min-w-0">
                  {cmt.authorNickname || cmt.author || "익명 승객"}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span suppressHydrationWarning className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(cmt.createdAt).toLocaleString()}
                  </span>
                  {isOwnerOrAdmin(cmt.authorId) && (
                    <div className="flex gap-2 text-[10px] font-bold pl-2 border-l border-gray-100">
                      <button onClick={() => { setEditingId(cmt.id); setEditContent(cmt.content); }} className="text-blue-400">수정</button>
                      <button onClick={() => handleDeleteComment(cmt.id)} className="text-gray-300">삭제</button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === cmt.id ? (
                <div className="flex flex-col gap-2 mb-2">
                  <input value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateComment(cmt.id)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">저장</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold">취소</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-2 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{cmt.content}</p>
              )}

              <button 
                onClick={() => handleReplyClick(cmt.id, cmt.authorNickname || "익명")} 
                className="text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors"
              >
                ↳ 답글 달기
              </button>

              {/* 대댓글 영역 (기존 로직 유지) */}
              <div className="mt-3 space-y-2">
                {comments.filter(reply => reply.parentId === cmt.id).map(reply => (
                  <div key={reply.id} className="ml-4 md:ml-6 pl-3 md:pl-4 border-l-[3px] border-blue-100 bg-gray-50/50 p-3 rounded-r-xl">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-bold text-gray-900 text-[11px] md:text-xs truncate min-w-0">
                        🚄 {reply.authorNickname || reply.author || "익명 승객"}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span suppressHydrationWarning className="text-[9px] text-gray-400 whitespace-nowrap">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                        {isOwnerOrAdmin(reply.authorId) && (
                          <div className="flex gap-2 text-[9px] font-bold pl-2 border-l border-gray-100">
                            <button onClick={() => { setEditingId(reply.id); setEditContent(reply.content); }} className="text-blue-400">수정</button>
                            <button onClick={() => handleDeleteComment(reply.id)} className="text-gray-300">삭제</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingId === reply.id ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <input value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full px-2 py-1 border rounded-md text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateComment(reply.id)} className="flex-1 py-1 bg-blue-600 text-white rounded-md text-[11px] font-bold">저장</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-1 bg-gray-200 text-gray-600 rounded-md text-[11px] font-bold">취소</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-[12px] md:text-sm whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🚀 블라인드 스타일 하단 고정 댓글 입력바 (새로운 UX) */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 transition-all duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] ${isExpanded ? 'h-auto p-4 pb-[env(safe-area-inset-bottom,20px)]' : 'h-20 flex items-center px-4 pb-[env(safe-area-inset-bottom)]'}`}>
        {!isExpanded ? (
          <div 
            onClick={() => { if(!user) return alert("로그인이 필요합니다! 🚂"); setIsExpanded(true); }}
            className="w-full h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center px-5 gap-3 cursor-pointer group"
          >
            <span className="text-gray-400 text-xl transition-transform group-active:scale-90">🖼️</span>
            <span className="text-gray-400 text-sm font-medium">댓글을 남겨주세요...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-blue-600 flex items-center gap-1">
                {replyTo ? `↳ ${replyTo.nickname}님에게 답글 남기는 중` : `🚄 ${user?.nickname}님`}
              </span>
              <button 
                type="button" 
                onClick={() => {setIsExpanded(false); setReplyTo(null); setContent("");}} 
                className="text-[11px] font-bold text-gray-400 px-2 py-1"
              >
                닫기
              </button>
            </div>
            <div className="flex items-end gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <span className="text-xl mb-1 opacity-50">🖼️</span>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? `${replyTo.nickname}님에게 따뜻한 답글을...` : "따뜻한 댓글을 남겨주세요..."}
                className="flex-1 bg-transparent border-none p-0 text-sm outline-none resize-none min-h-[80px]"
                rows={3}
              />
              <button 
                type="submit" 
                disabled={isLoading || !content.trim()}
                className="bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl shadow-md active:scale-95 disabled:bg-gray-200 transition-all text-sm shrink-0 mb-0.5"
              >
                {isLoading ? "..." : "등록"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}