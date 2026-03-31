import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton, CommentForm } from "./ClientArea";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  
  // 1. 게시글 데이터 가져오기
  const doc = await adminDb.collection("posts").doc(id).get();
  if (!doc.exists) return notFound();
  const post = doc.data();

  // 2. 이 글에 달린 댓글 데이터 가져오기 (최신순 정렬)
  const commentsSnapshot = await adminDb.collection("posts").doc(id).collection("comments").orderBy("createdAt", "desc").get();
  const comments = commentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 상단 네비게이션 & 삭제 버튼 */}
      <div className="flex justify-between items-center">
        <Link href="/board" className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors">
          ← 목록으로 돌아가기
        </Link>
        {/* 💡 방금 만든 삭제 버튼 부품 삽입 */}
        <DeleteButton postId={id} />
      </div>

      {/* 게시글 본문 카드 */}
      <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 bg-gray-50/30">
          <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-tight mb-6">
            {post?.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {post?.author?.charAt(0)}
              </span>
              <span className="font-bold text-gray-900">{post?.author}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span>{new Date(post?.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-10">
          <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap min-h-[200px]">
            {post?.content}
          </div>
        </div>
      </article>

      {/* 댓글 영역 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
        <h3 className="text-xl font-bold text-gray-900 mb-6">댓글 {comments.length}개</h3>

        {/* 댓글 목록 */}
        <div className="space-y-6 mb-8">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
          ) : (
            comments.map((cmt: any) => (
              <div key={cmt.id} className="border-b border-gray-50 pb-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-900 text-sm">{cmt.author}</span>
                  <span className="text-xs text-gray-400">{new Date(cmt.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-700">{cmt.content}</p>
              </div>
            ))
          )}
        </div>

        {/* 💡 방금 만든 댓글 작성 폼 부품 삽입 */}
        <CommentForm postId={id} />
      </div>
    </div>
  );
}