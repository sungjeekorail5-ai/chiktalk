"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  category?: string; // 💡 카테고리 속성 추가
  isNotice?: boolean; // 💡 공지사항 속성 추가
  author?: string;
  authorNickname?: string;
  createdAt: any;
  views?: number;
  commentCount?: number;
  likeCount?: number; 
}

// 💡 마법의 시간 계산 함수 (성지님 원본 유지)
function timeAgo(dateInput: any) {
  if (!dateInput) return "방금 전";
  let date: Date;
  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput.toDate) {
    date = dateInput.toDate();
  } else if (dateInput.seconds || dateInput._seconds) {
    const s = dateInput.seconds || dateInput._seconds;
    date = new Date(s * 1000);
  } else {
    return "방금 전";
  }
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // 💡 [추가] 현재 선택된 탭 상태 관리 (기본값: 자유게시판)
  const [activeTab, setActiveTab] = useState("free");

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
    if (confirm("정말로 이 게시글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.")) {
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

  // 💡 [핵심 필터링] 카테고리별로 먼저 나누기
  const categoryPosts = posts.filter(post => {
    const postCategory = post.category || "free";
    return postCategory === activeTab;
  });

  // 💡 [공지/일반 분리] 카테고리 내에서 공지와 일반 글을 나눕니다.
  const noticePosts = categoryPosts.filter(post => post.isNotice === true);
  const regularPosts = categoryPosts.filter(post => !post.isNotice);

  if (isLoading) return <div className="text-center py-20 font-bold text-gray-400">데이터 로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-0 md:px-4 space-y-4 animate-fade-in">
      
      {/* 📣 상단 타이틀 영역 (성지님 원본 유지) */}
      <div className="px-5 py-6 bg-white border-b border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">게시판 🚉</h1>
          {isLoggedIn && (
            <Link 
              href="/board/write" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors active:scale-95 shadow-sm"
            >
              글쓰기 ✍️
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-400 font-medium">다양한 이야기가 모이는 곳</p>
        
        {/* 📑 탭 버튼 영역 (성지님 원본 유지) */}
        <div className="flex border-t border-gray-100 pt-2 mt-4">
          <button
            onClick={() => setActiveTab("free")}
            className={`flex-1 py-3 text-sm font-black transition-all ${
              activeTab === "free" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-400 hover:text-gray-600"
            }`}
          >
            💬 자유게시판
          </button>
          <button
            onClick={() => setActiveTab("inquiry")}
            className={`flex-1 py-3 text-sm font-black transition-all ${
              activeTab === "inquiry" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-400 hover:text-gray-600"
            }`}
          >
            🙋‍♂️ 앱 문의사항
          </button>
        </div>
      </div>

      {/* 📋 게시글 목록 영역 */}
      <div className="bg-gray-50/50 min-h-screen space-y-2">
        
        {/* 📌 [공지사항 영역] 슬림하고 공간을 적게 차지하도록 한 줄 디자인으로 구성 */}
        {noticePosts.length > 0 && (
          <div className="mb-4 space-y-1 px-1">
            {noticePosts.map((notice) => (
              <Link 
                key={notice.id} 
                href={`/board/${notice.id}`}
                className="flex items-center gap-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl transition-all group"
              >
                {/* NOTICE 뱃지 */}
                <span className="shrink-0 bg-blue-600 text-[10px] text-white font-black px-2 py-0.5 rounded-full tracking-tighter">
                  NOTICE
                </span>
                {/* 제목 (한 줄만 깔끔하게) */}
                <h3 className="flex-1 text-sm font-bold text-blue-900 truncate group-hover:text-blue-700">
                  {notice.title}
                </h3>
                {/* 날짜 */}
                <span className="shrink-0 text-[10px] text-blue-300 font-bold italic">
                  {timeAgo(notice.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* 📋 일반 게시글 목록 */}
        {regularPosts.length > 0 ? (
          regularPosts.map((post) => (
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

                  {/* 📊 지표 아이콘 영역 (성지님 원본 유지) */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-gray-400">
                      <span className="text-[12px] font-bold">👀 {post.views || 0}</span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${post.commentCount ? 'text-blue-500' : 'text-gray-300'}`}>
                      <span className="text-[12px] font-bold">💬 {post.commentCount || 0}</span>
                    </div>

                    <div className={`flex items-center gap-1 ${post.likeCount ? 'text-red-500' : 'text-gray-300'}`}>
                      <span className="text-[12px] font-bold">❤️ {post.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 font-bold bg-white border-b border-gray-50">
            <span className="text-2xl block mb-2 opacity-50">📭</span>
            작성된 글이 없습니다.
          </div>
        )}
      </div>

      <div className="py-10 text-center">
        <p className="text-[10px] text-gray-300 font-black tracking-[0.3em] uppercase">CHIKCHIK TALK PRIVATE</p>
      </div>
    </div>
  );
}