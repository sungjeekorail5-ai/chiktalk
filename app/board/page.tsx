import { adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
}

export default async function BoardPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("session");

  let posts: Post[] = [];
  try {
    const snapshot = await adminDb.collection("posts").orderBy("createdAt", "desc").get();
    posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  } catch (error) {
    console.error("데이터 로딩 실패:", error);
  }

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-0 md:px-4 space-y-4">
      
      {/* 📣 블라인드 스타일 헤더 */}
      <div className="px-5 py-6 bg-white border-b border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">자유게시판</h1>
          {isLoggedIn && (
            <Link href="/board/write" className="text-blue-600 font-bold text-sm">글쓰기</Link>
          )}
        </div>
        <p className="text-sm text-gray-400 font-medium">비공개 공간에서 자유롭게 대화하세요</p>
      </div>

      {/* 📋 게시글 피드 (블라인드 리스트 스타일) */}
      <div className="bg-gray-50/50 min-h-screen space-y-2">
        {posts.map((post) => (
          <Link 
            href={`/board/${post.id}`} 
            key={post.id}
            className="block bg-white px-5 py-6 transition-colors active:bg-gray-50 border-b border-gray-50"
          >
            <div className="space-y-3">
              {/* 상단 정보: 작성자 & 시간 */}
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <span className="text-blue-600">{post.author}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400">
                  {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "방금 전"}
                </span>
              </div>

              {/* 제목 & 본문 미리보기 */}
              <div className="space-y-1">
                <h3 className="text-[17px] font-bold text-gray-900 leading-snug">
                  {post.title}
                </h3>
                <p className="text-[14px] text-gray-500 line-clamp-2 leading-normal font-medium">
                  {post.content}
                </p>
              </div>

              {/* 하단 아이콘 (댓글/조회수 느낌만 줌) */}
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
        ))}
      </div>

      <div className="py-10 text-center">
        <p className="text-[10px] text-gray-300 font-black tracking-[0.3em] uppercase">CHIKCHIK TALK PRIVATE</p>
      </div>
    </div>
  );
}