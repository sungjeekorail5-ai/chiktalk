"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(""); // 💡 현재 접속한 유저 아이디 저장
  const [isLoading, setIsLoading] = useState(true);

  // 👑 [슈퍼 관리자 설정] 여기에 성지님의 진짜 로그인 아이디를 적으세요!
  const ADMIN_ID = "sungjee90"; 
  
  // 1️⃣ 데이터 로딩 및 권한 확인
  useEffect(() => {
    async function fetchData() {
      try {
        // 서버 API(/api/board/list)는 posts 목록과 함께 
        // 현재 로그인한 사람의 userId를 같이 쏴줘야 합니다.
        const res = await fetch("/api/board/list");
        const data = await res.json();
        
        setPosts(data.posts || []);
        setIsLoggedIn(data.isLoggedIn);
        setCurrentUserId(data.userId || ""); // 💡 서버에서 보낸 아이디 세팅
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 💡 아이디가 성지님 것과 일치하는지 확인!
  const isAdmin = isLoggedIn && currentUserId === ADMIN_ID;

  // 🗑️ 삭제 핸들러
  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("성지님, 이 글 진짜 지울까요? 🧹")) {
      try {
        const res = await fetch(`/api/board/delete?id=${postId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("깔끔하게 지웠습니다! 🚀");
          setPosts(posts.filter((p) => p.id !== postId));
        } else {
          const errorData = await res.json();
          alert(errorData.message || "삭제 실패 ㅠㅠ 성지님 아이디가 맞나요?");
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
                      <span className="text-blue-600">{post.author}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-400">
                        {post.createdAt?.seconds 
                          ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() 
                          : "방금 전"}
                      </span>
                    </div>

                    {/* 🛡️ 오직 성지님(Admin 아이디)에게만 보이는 삭제 버튼 */}
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
                    <div className="flex items-center gap-1 text-gray-300">
                      <span className="text-[12px] font-bold">💬 0</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <span className="text-[12px] font-bold">👍 0</span>
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