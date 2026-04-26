"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  category?: string;
  isNotice?: boolean;
  author?: string;
  authorNickname?: string;
  createdAt: any;
  views?: number;
  commentCount?: number;
  likeCount?: number;
}

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
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"free" | "inquiry">("free");

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
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.")) return;
    try {
      const res = await fetch(`/api/board/delete?id=${postId}`, { method: "DELETE" });
      if (res.ok) setPosts(posts.filter((p) => p.id !== postId));
    } catch {
      alert("서버 오류가 발생했습니다.");
    }
  };

  const categoryPosts = posts.filter((p) => (p.category || "free") === activeTab);
  const noticePosts = categoryPosts.filter((p) => p.isNotice === true);
  const regularPosts = categoryPosts.filter((p) => !p.isNotice);

  if (isLoading) {
    return (
      <div className="text-center py-20 font-bold text-gray-400">
        데이터 로딩 중...
      </div>
    );
  }

  return (
    <>
      {/* ============================ MOBILE ============================ */}
      <div className="md:hidden">
        {/* 헤더 */}
        <div className="px-5 pt-6 pb-3 bg-white">
          <div className="flex items-end justify-between mb-1">
            <h1 className="text-[26px] font-extrabold tracking-tight text-gray-900">
              게시판
            </h1>
            {isLoggedIn && (
              <Link
                href="/board/write"
                className="bg-gray-900 active:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                글쓰기
              </Link>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-500">
            다양한 이야기가 모이는 곳
          </p>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-100 px-5 bg-white sticky top-14 z-40">
          <button
            onClick={() => setActiveTab("free")}
            className={`flex-1 py-3.5 text-[15px] font-bold transition-colors border-b-2 -mb-px ${
              activeTab === "free"
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 border-transparent"
            }`}
          >
            자유게시판
          </button>
          <button
            onClick={() => setActiveTab("inquiry")}
            className={`flex-1 py-3.5 text-[15px] font-bold transition-colors border-b-2 -mb-px ${
              activeTab === "inquiry"
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 border-transparent"
            }`}
          >
            앱 문의사항
          </button>
        </div>

        {/* 공지 */}
        {noticePosts.length > 0 && (
          <div className="px-5 py-3 space-y-2 bg-gray-50">
            {noticePosts.map((notice) => (
              <Link
                key={notice.id}
                href={`/board/${notice.id}` as any}
                className="flex items-center gap-3 bg-blue-50 active:bg-blue-100 px-4 py-3 rounded-2xl transition-colors"
              >
                <span className="shrink-0 text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded">
                  공지
                </span>
                <h3 className="flex-1 text-sm font-bold text-blue-900 truncate">
                  {notice.title}
                </h3>
                <span className="text-[10px] font-semibold text-blue-400 shrink-0">
                  {timeAgo(notice.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* 일반 글 */}
        <div className="bg-white">
          {regularPosts.length > 0 ? (
            regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/board/${post.id}` as any}
                className="block px-5 py-5 border-b border-gray-50 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-blue-600">
                      {post.authorNickname || post.author || "익명 승객"}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-400">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, post.id)}
                      className="text-[10px] font-extrabold text-red-500 px-2 py-1 bg-red-50 rounded-md"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <h3 className="text-[16px] font-bold text-gray-900 leading-snug tracking-tight mb-1">
                  {post.title}
                </h3>
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug font-medium">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 mt-3 text-[11px] font-semibold text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {post.views || 0}
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      post.commentCount ? "text-blue-500" : ""
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {post.commentCount || 0}
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      post.likeCount ? "text-red-500" : ""
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {post.likeCount || 0}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm font-bold">작성된 글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================ DESKTOP (기존) ============================ */}
      <div className="hidden md:block max-w-2xl mx-auto py-10 px-4 space-y-4 animate-fade-in">
        <div className="px-5 py-6 bg-white border-b border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              게시판 🚉
            </h1>
            {isLoggedIn && (
              <Link
                href="/board/write"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors active:scale-95 shadow-sm"
              >
                글쓰기 ✍️
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-400 font-medium">
            다양한 이야기가 모이는 곳
          </p>
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

        <div className="bg-gray-50/50 min-h-screen space-y-2">
          {noticePosts.length > 0 && (
            <div className="mb-4 space-y-1 px-1">
              {noticePosts.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/board/${notice.id}` as any}
                  className="flex items-center gap-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl transition-all group"
                >
                  <span className="shrink-0 bg-blue-600 text-[10px] text-white font-black px-2 py-0.5 rounded-full tracking-tighter">
                    NOTICE
                  </span>
                  <h3 className="flex-1 text-sm font-bold text-blue-900 truncate group-hover:text-blue-700">
                    {notice.title}
                  </h3>
                  <span className="shrink-0 text-[10px] text-blue-300 font-bold italic">
                    {timeAgo(notice.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {regularPosts.length > 0 ? (
            regularPosts.map((post) => (
              <div key={post.id} className="relative group">
                <Link
                  href={`/board/${post.id}` as any}
                  className="block bg-white px-5 py-6 transition-colors active:bg-gray-50 border-b border-gray-50"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px] font-bold">
                        <span className="text-blue-600">
                          {post.authorNickname || post.author || "익명 승객"}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">
                          {timeAgo(post.createdAt)}
                        </span>
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
                      <h3 className="text-[17px] font-bold text-gray-900 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[14px] text-gray-500 line-clamp-2 leading-normal font-medium">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-[12px] font-bold">
                          👀 {post.views || 0}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          post.commentCount ? "text-blue-500" : "text-gray-300"
                        }`}
                      >
                        <span className="text-[12px] font-bold">
                          💬 {post.commentCount || 0}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          post.likeCount ? "text-red-500" : "text-gray-300"
                        }`}
                      >
                        <span className="text-[12px] font-bold">
                          ❤️ {post.likeCount || 0}
                        </span>
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
          <p className="text-[10px] text-gray-300 font-black tracking-[0.3em] uppercase">
            CHIKCHIK TALK PRIVATE
          </p>
        </div>
      </div>
    </>
  );
}
