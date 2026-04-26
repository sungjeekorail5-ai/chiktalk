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

  const doc = await postRef.get();
  if (!doc.exists) return notFound();
  const post = doc.data();

  await postRef.update({ views: FieldValue.increment(1) });

  const commentsSnapshot = await adminDb
    .collection("posts")
    .doc(id)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();

  const comments = commentsSnapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    };
  });

  const displayNickname = post?.authorNickname || post?.author || "익명 승객";

  return (
    <>
      {/* ============================ MOBILE ============================ */}
      <div className="md:hidden bg-white min-h-screen">
        {/* 상단 백 네비 */}
        <div className="flex items-center justify-between px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
          <Link
            href="/board"
            className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-sm font-bold">목록</span>
          </Link>
          <PostActionButtons postId={id} authorId={post?.authorId || ""} />
        </div>

        <article className="px-5 py-6">
          {/* 제목 */}
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-gray-900">
            {post?.title}
          </h1>

          {/* 작성자 + 날짜 */}
          <div className="flex items-center gap-2 mt-3 text-xs">
            <div className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {displayNickname.charAt(0)}
            </div>
            <span className="font-bold text-gray-900">{displayNickname}</span>
            <span className="text-gray-300">·</span>
            <span suppressHydrationWarning className="text-gray-400 font-medium">
              {formatTimestamp(post?.createdAt)}
            </span>
          </div>

          {/* 메타 (조회/댓글/좋아요) */}
          <div className="flex items-center gap-4 mt-3 pb-4 border-b border-gray-100 text-[11px] font-semibold text-gray-400">
            <span>조회 {(post?.views || 0) + 1}</span>
            <span>댓글 {comments.length}</span>
            <span>좋아요 {post?.likeCount || 0}</span>
          </div>

          {/* 본문 */}
          <div className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap pt-5 min-h-[120px]">
            {post?.content}

            {/* 이미지 */}
            {Array.isArray(post?.images) && post.images.length > 0 && (
              <div className="mt-5 space-y-3">
                {post.images.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl bg-gray-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`첨부 이미지 ${idx + 1}`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 좋아요/댓글 버튼 */}
          <div className="flex items-center justify-center gap-3 py-6 border-t border-gray-100 mt-8">
            <LikeButton
              postId={id}
              initialLikes={post?.likeCount || 0}
              likedUsers={post?.likedUsers || []}
            />
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 border border-gray-100">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-700"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm font-extrabold text-gray-900">
                {comments.length}
              </span>
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <CommentSection postId={id} comments={comments} />
      </div>

      {/* ============================ DESKTOP (기존) ============================ */}
      <div className="hidden md:block max-w-4xl mx-auto space-y-8 px-4 md:px-0">
        <div className="flex justify-between items-center py-2">
          <Link
            href="/board"
            className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-all text-sm"
          >
            ← CHIKCHIK 목록
          </Link>
          <PostActionButtons postId={id} authorId={post?.authorId || ""} />
        </div>

        <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-gray-50 bg-gray-50/30">
            <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-tight mb-6">
              {post?.title}
            </h1>

            <div className="flex items-center justify-between w-full text-[13px] mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                  {displayNickname.charAt(0)}
                </span>
                <span className="font-bold text-gray-900 truncate">
                  {displayNickname}
                </span>
              </div>
              <span suppressHydrationWarning className="text-gray-400 font-medium shrink-0 ml-4">
                {formatTimestamp(post?.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100/50">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Views</span>
                <span className="text-blue-600 font-black text-xs">
                  {(post?.views || 0) + 1}
                </span>
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

          <div className="p-10 text-gray-800 leading-relaxed text-lg whitespace-pre-wrap min-h-[200px]">
            {post?.content}

            {Array.isArray(post?.images) && post.images.length > 0 && (
              <div className="mt-6 space-y-3">
                {post.images.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`첨부 이미지 ${idx + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-10 border-t border-gray-50 bg-gray-50/10 gap-4">
            <div className="flex items-center gap-6">
              <LikeButton
                postId={id}
                initialLikes={post?.likeCount || 0}
                likedUsers={post?.likedUsers || []}
              />
              <div className="flex flex-col items-center gap-1 px-8 py-3 rounded-[2rem] bg-gray-50 border border-gray-100">
                <span className="text-2xl">💬</span>
                <span className="text-lg font-black text-gray-900">{comments.length}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase">
              ChikChik TalkTalk
            </p>
          </div>
        </article>

        <CommentSection postId={id} comments={comments} />

        <div className="py-20 text-center">
          <p className="text-[10px] text-gray-300 font-black tracking-[0.4em] uppercase">
            CHIKCHIK TALK PRIVATE END
          </p>
        </div>
      </div>
    </>
  );
}
