"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export default function MyPostsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyPosts = async () => {
      try {
        // 💡 1. 서랍 이름 맞추기: 'board' -> 'posts'
        const postsRef = collection(db, "posts"); 
        
        // 💡 2. 이름표 맞추기: 'author' -> 'authorNickname'
        const q = query(
          postsRef,
          where("authorNickname", "==", user.nickname), 
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];

        setPosts(fetchedPosts);
      } catch (error: any) {
        console.error("내 글을 불러오는 중 에러 발생:", error);
        // 🚨 혹시 Firestore 인덱스 에러가 나면 콘솔창의 링크를 클릭해서 인덱스를 생성해주세요!
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

  // 💡 3. 날짜 에러 방어 로직 (텍스트 날짜와 파이어베이스 날짜 모두 호환되게 처리)
  const formatDate = (dateData: any) => {
    if (!dateData) return '날짜 정보 없음';
    if (typeof dateData === 'string') return new Date(dateData).toLocaleDateString();
    if (dateData.toDate) return dateData.toDate().toLocaleDateString();
    return '날짜 정보 없음';
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* 🔙 뒤로가기 버튼 & 타이틀 */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button onClick={() => router.back()} className="text-2xl text-gray-400 hover:text-gray-900 transition-colors active:scale-90">
          ❮
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            내가 쓴 글 <span className="text-blue-600">📝</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-bold mt-1">탑승객님이 남기신 발자취입니다.</p>
        </div>
      </div>

      {/* 📋 게시글 리스트 영역 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-bold">
            <span className="inline-block animate-spin mr-2">🔄</span> 글을 불러오는 중...
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/board/${post.id}`} 
              className="block bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <h3 className="text-lg font-black text-gray-900 truncate mb-2">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 truncate mb-3">
                {post.content}
              </p>
              <div className="text-[11px] font-bold text-gray-400">
                {formatDate(post.createdAt)}
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] py-20 text-center">
            <div className="text-4xl mb-4 opacity-50">📭</div>
            <p className="text-sm sm:text-base text-gray-500 font-black mb-4">아직 작성하신 글이 없습니다.</p>
            <Link href="/board" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-all active:scale-95 text-sm">
              첫 글 쓰러 가기 ✍️
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}