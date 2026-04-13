import { adminDb, FieldValue } from "@/lib/firebase-admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostActionButtons, CommentSection, LikeButton } from "./ClientArea";

// 💡 Firestore Timestamp → 표시용 문자열 변환
function formatTimestamp(ts: any): string {
  if (!ts) return "";
  if (ts.toDate) return ts.toDate().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  if (typeof ts === "string") return new Date(ts).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  return "";
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const postRef = adminDb.collection("posts").doc(id);

  // 1. 데이터 가져오기
  const doc = await postRef.get();
  if (!doc.exists) return notFound();
  const post = doc.data();

  // 2. 조회수 증가 (글이 존재할 때만)
  await postRef.update({ views: FieldValue.increment(1) });

  // 댓글 데이터 가져오기 (오래된 순)
  const commentsSnapshot = await adminDb
    .collection("posts")
    .doc(id)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();
    
  const comments = commentsSnapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      // 💡 Firestore Timestamp → ISO 문자열로 변환 (클라이언트 컴포넌트에 전달용)
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  });

  const displayNickname = post?.authorNickname || post?.author || "익명 승객";

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0">
      
      {/* 🧭 상단 네비게이션 */}
      <div className="flex justify-between items-center py-2">
        <Link href="/board" className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-all text-sm">
          ← CHIKCHIK 목록
        </Link>
        <PostActionButtons postId={id} authorId={post?.authorId || ""} />
      </div>

      <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* 📝 게시글 헤더 영역 */}
        <div className="p-6 md:p-10 border-b border-gray-50 bg-gray-50/30">
          <h1 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-6">
            {post?.title}
          </h1>
          
          {/* 💡 닉네임과 날짜를 한 줄로 배치 (양 끝 정렬) */}
          <div className="flex items-center justify-between w-full text-[12px] md:text-[13px] mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                {displayNickname.charAt(0)}
              </span>
              {/* 닉네임이 길어도 화면을 뚫고 나가지 않게 truncate 처리 */}
              <span className="font-bold text-gray-900 truncate">
                {displayNickname}
              </span>
            </div>
            
            <span suppressHydrationWarning className="text-gray-400 font-medium shrink-0 ml-4">
              {formatTimestamp(post?.createdAt)}
            </span>
          </div>

          {/* 📊 하단 메타 지표 (조회수/댓글/좋아요) */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100/50">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Views</span>
              <span className="text-blue-600 font-black text-xs">{(post?.views || 0) + 1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Comments</span>
              <span className="text-blue-600 font-black text-xs">{comments.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Likes</span>
              <span className="text-red-500 font-black text-xs">{post?.likeCount || 0}</span>
            </div>
          </div>
        </div>

        {/* 📄 본문 내용 */}
        <div className="p-6 md:p-10 text-gray-800 leading-relaxed text-base md:text-lg whitespace-pre-wrap min-h-[200px]">
          {post?.content}
        </div>

        {/* ❤️ 좋아요 & 💬 댓글수 표시 영역 */}
        <div className="flex flex-col items-center justify-center py-10 border-t border-gray-50 bg-gray-50/10 gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <LikeButton 
              postId={id} 
              initialLikes={post?.likeCount || 0} 
              likedUsers={post?.likedUsers || []} 
            />
            <div className="flex flex-col items-center gap-1 px-6 md:px-8 py-2 md:py-3 rounded-[2rem] bg-gray-50 border border-gray-100">
              <span className="text-xl md:text-2xl">💬</span>
              <span className="text-base md:text-lg font-black text-gray-900">{comments.length}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase">ChikChik TalkTalk</p>
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