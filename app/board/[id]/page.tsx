import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostActionButtons, CommentSection } from "./ClientArea";
import { FieldValue } from "firebase-admin/firestore"; // 💡 숫자 증가를 위해 필요합니다!

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  
  const postRef = adminDb.collection("posts").doc(id);

  // 💡 1. 조회수 1 증가 (Atomic Increment)
  // 사용자가 이 페이지에 접속할 때마다 DB의 views 값이 1씩 자동으로 올라갑니다.
  await postRef.update({
    views: FieldValue.increment(1)
  });

  // 2. 게시글 데이터 가져오기
  const doc = await postRef.get();
  if (!doc.exists) return notFound();
  const post = doc.data();

  // 3. 이 글에 달린 댓글 데이터 가져오기 (최신순 정렬)
  const commentsSnapshot = await adminDb.collection("posts").doc(id).collection("comments").orderBy("createdAt", "desc").get();
  const comments = commentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const displayNickname = post?.authorNickname || post?.author || "익명 승객";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 상단 네비게이션 & 삭제/수정 버튼 */}
      <div className="flex justify-between items-center px-4 md:px-0">
        <Link href="/board" className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors">
          ← 목록으로 돌아가기
        </Link>
        <PostActionButtons postId={id} authorId={post?.authorId || ""} />
      </div>

      {/* 게시글 본문 카드 */}
      <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 bg-gray-50/30">
          <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-tight mb-6">
            {post?.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {displayNickname.charAt(0)}
              </span>
              <span className="font-bold text-gray-900">{displayNickname}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span suppressHydrationWarning>{new Date(post?.createdAt).toLocaleString()}</span>
            
            {/* 💡 4. 조회수 표시 추가! */}
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1 font-medium">
              <span className="text-gray-400 font-bold text-xs uppercase tracking-tighter">Views</span>
              <span className="text-blue-600 font-black">{(post?.views || 0) + 1}</span> 
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap min-h-[200px]">
            {post?.content}
          </div>
        </div>
      </article>

      {/* 댓글 영역 */}
      <CommentSection postId={id} comments={comments} />
    </div>
  );
}