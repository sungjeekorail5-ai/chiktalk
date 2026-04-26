"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export default function MyPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(
          postsRef,
          where("authorId", "==", user.id),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setPosts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[]
        );
      } catch (error) {
        console.error("내 글을 불러오는 중 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

  const formatDate = (dateData: any) => {
    if (!dateData) return "";
    if (typeof dateData === "string")
      return new Date(dateData).toLocaleDateString("ko-KR");
    if (dateData.toDate) return dateData.toDate().toLocaleDateString("ko-KR");
    if (dateData.seconds || dateData._seconds) {
      const s = dateData.seconds || dateData._seconds;
      return new Date(s * 1000).toLocaleDateString("ko-KR");
    }
    return "";
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 백 네비 */}
      <div className="md:hidden flex items-center px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/profile"
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">뒤로</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-4 py-6 space-y-5">
        <div>
          <h1 className="text-[22px] md:text-2xl font-extrabold text-gray-900 tracking-tight">
            내가 쓴 글
          </h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">
            지금까지 남기신 발자취예요
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-bold text-sm">
            불러오는 중...
          </div>
        ) : posts.length > 0 ? (
          <div className="bg-white md:rounded-2xl md:border md:border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/board/${post.id}` as any}
                className="block px-5 py-4 active:bg-gray-50 transition-colors"
              >
                <h3 className="text-[16px] font-bold text-gray-900 tracking-tight truncate mb-1">
                  {post.title}
                </h3>
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug font-medium">
                  {post.content}
                </p>
                <div className="text-[11px] font-semibold text-gray-400 mt-2">
                  {formatDate(post.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-3xl py-16 text-center">
            <p className="text-sm text-gray-500 font-bold mb-4">
              아직 작성하신 글이 없어요
            </p>
            <Link
              href="/board"
              className="inline-block bg-blue-600 active:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              첫 글 쓰러 가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
