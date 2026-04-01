"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  author?: string;
  authorNickname?: string;
  createdAt: any;
  views?: number;
  commentCount?: number;
  likeCount?: number; // 💡 좋아요 숫자 타입 추가
}

// 💡 마법의 시간 계산 함수
function timeAgo(dateInput: any) {
  if (!dateInput) return "방금 전";
  let date: Date;
  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    return "방금 전";
  }
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return date.toLocaleDateString();
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const ADMIN_ID = "sungjee90"; 
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/board/list");
        const data = await res.json();
        setPosts(data.posts || []);
        setIsLoggedIn(data.isLoggedIn);
        setCurrentUserId(data.userId || "");
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAdmin = isLoggedIn && currentUserId === ADMIN_ID;

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("성지님, 이 글 진짜 지울까요? 🧹")) {
      try {
        const res = await fetch(`/api/board/delete?id=${postId}`, { method: "DELETE" });
        if (res.ok) {
          setPosts(posts.filter((p) => p.id !== postId));
        }
      } catch (err) {
        alert("서버 오류가 발생했습니다.");
      }
    }
  };

  if (isLoading) return <div className="text-center py-20 font-bold text-gray-400">데이터 로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-0 md:px-4 space-y-4">
      <div className="px-5 py-6 bg-white border-b border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">자유게시판</h1>
          {isLoggedIn && (
            <Link href="/board/write" className="text-blue-600 font-bold text-sm">글쓰기</Link>
          )}
        </div>
        <p className="text-sm text-gray-400 font-medium">비공개 공간에서 자유롭게 대화하세요</p>
      </div>

      <div className="bg-gray-50/50 min-h-screen space-y-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="relative group">
              <Link 
                href={`/board/${post.id}`} 
                className="block bg-white px-5 py-6 transition-colors active:bg-gray-50 border-b border-gray-50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-bold">
                      <span className="text-blue-600">{post.authorNickname || post.author || "익명 승객"}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-400">{timeAgo(post.createdAt)}</span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, post.id)}
                        className="text-[10px] font-black text-red-500 hover:text-white px-2 py-1 bg-red-50 hover:bg-red-500 rounded-md transition-all"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-gray-900 leading-snug">{post.title}</h3>
                    <p className="text-[14px] text-gray-500 line-clamp-2 leading-normal font-medium">{post.content}</p>
                  </div>

                  {/* 📊 지표 아이콘 영역 */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-gray-400">
                      <span className="text-[12px] font-bold">👀 {post.views || 0}</span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${post.commentCount ? 'text-blue-500' : 'text-gray-300'}`}>
                      <span className="text-[12px] font-bold">💬 {post.commentCount || 0}</span>
                    </div>

                    {/* 💡 좋아요 숫자 연동 완료! 좋아요가 있으면 빨간색으로 빛납니다. */}
                    <div className={`flex items-center gap-1 ${post.likeCount ? 'text-red-500' : 'text-gray-300'}`}>
                      <span className="text-[12px] font-bold">❤️ {post.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-300 font-bold">작성된 글이 없습니다.</div>
        )}
      </div>

      <div className="py-10 text-center">
        <p className="text-[10px] text-gray-300 font-black tracking-[0.3em] uppercase">CHIKCHIK TALK PRIVATE</p>
      </div>
    </div>
  );
}