"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase"; // 💡 파이어베이스 클라이언트 설정 파일 경로
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 💡 게시글 데이터 타입 정의 (성지님 DB 구조에 맞게 수정 가능)
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
    // 유저 정보가 없으면 안 됨!
    if (!user) return;

    const fetchMyPosts = async () => {
      try {
        // 🚨 중요: 'board' 부분은 실제 파이어베이스 컬렉션 이름으로 변경하세요! (예: 'posts', 'board' 등)
        const postsRef = collection(db, "board"); 
        
        // 🚨 중요: 'author' 부분은 실제 작성자 닉네임이 저장되는 필드명으로 변경하세요!
        // 쿼리: 작성자가 내 닉네임과 일치하는 글만, 최신순으로 가져오기
        const q = query(
          postsRef,
          where("author", "==", user.nickname), 
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("내 글을 불러오는 중 에러 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

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
          // 로딩 중일 때
          <div className="text-center py-20 text-gray-400 font-bold">
            <span className="inline-block animate-spin mr-2">🔄</span> 글을 불러오는 중...
          </div>
        ) : posts.length > 0 ? (
          // 내가 쓴 글이 있을 때
          posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/board/${post.id}`} // 💡 실제 게시판 상세 페이지 경로로 맞춰주세요!
              className="block bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <h3 className="text-lg font-black text-gray-900 truncate mb-2">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 truncate mb-3">
                {post.content}
              </p>
              <div className="text-[11px] font-bold text-gray-400">
                {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : '날짜 정보 없음'}
              </div>
            </Link>
          ))
        ) : (
          // 내가 쓴 글이 없을 때
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