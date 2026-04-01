import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostActionButtons, CommentSection, LikeButton } from "./ClientArea"; 
import { FieldValue } from "firebase-admin/firestore"; 

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const postRef = adminDb.collection("posts").doc(id);

  // 1. 조회수 증가
  await postRef.update({ views: FieldValue.increment(1) });

  // 2. 데이터 가져오기
  const doc = await postRef.get();
  if (!doc.exists) return notFound();
  const post = doc.data();

  // 댓글 데이터 가져오기 (오래된 순)
  const commentsSnapshot = await adminDb
    .collection("posts")
    .doc(id)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();
    
  const comments = commentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const displayNickname = post?.authorNickname || post?.author || "익명 승객";

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0">
      
      {/* 🧭 상단 네비게이션 */}
      <div className="flex justify-between items-center py-2">
        <Link href="/board" className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-all">
          ← CHIKCHIK 목록
        </Link>
        <PostActionButtons postId={id} authorId={post?.authorId || ""} />
      </div>

      <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* 📝 게시글 헤더 영역 */}
        <div className="p-10 border-b border-gray-50 bg-gray-50/30">
          <h1 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-6">
            {post?.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                {displayNickname.charAt(0)}
              </span>
              <span className="font-bold text-gray-900">{displayNickname}</span>
            </div>
            
            <span className="text-gray-200">|</span>
            <span suppressHydrationWarning className="text-gray-400 font-medium">
              {new Date(post?.createdAt).toLocaleString()}
            </span>

            <span className="text-gray-200">|</span>
            
            {/* 📊 상단 메타 지표 세트 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Views</span>
                <span className="text-blue-600 font-black">{(post?.views || 0) + 1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Comments</span>
                <span className="text-blue-600 font-black">{comments.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Likes</span>
                <span className="text-red-500 font-black">{post?.likeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📄 본문 내용 */}
        <div className="p-10 text-gray-800 leading-relaxed text-lg whitespace-pre-wrap min-h-[250px]">
          {post?.content}
        </div>

        {/* ❤️ 좋아요 & 💬 댓글수 표시 영역 */}
        <div className="flex flex-col items-center justify-center py-12 border-t border-gray-50 bg-gray-50/10 gap-4">
          <div className="flex items-center gap-6">
            {/* 좋아요 버튼 */}
            <LikeButton 
              postId={id} 
              initialLikes={post?.likeCount || 0} 
              likedUsers={post?.likedUsers || []} 
            />
            
            {/* 💡 요청하신 하트 옆 댓글 숫자 표시! */}
            <div className="flex flex-col items-center gap-1 px-8 py-3 rounded-[2rem] bg-gray-50 border border-gray-100">
              <span className="text-2xl">💬</span>
              <span className="text-lg font-black text-gray-900">{comments.length}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-300 font-black tracking-[0.2em] uppercase">ChikChik TalkTalk</p>
        </div>

      </article>

      {/* 💬 댓글 섹션 */}
      <CommentSection postId={id} comments={comments} />
      
      <div className="py-20 text-center">
        <p className="text-[10px] text-gray-300 font-black tracking-[0.4em] uppercase">CHIKCHIK TALK PRIVATE END</p>
      </div>
    </div>
  );
}