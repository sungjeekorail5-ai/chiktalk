import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    // 💡 서버 세션에서 유저 확인 (클라이언트가 보낸 userId 무시)
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session || session === "guest_session") {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(session).get();
    if (!userDoc.exists) {
      return NextResponse.json({ message: "세션이 만료되었습니다." }, { status: 401 });
    }

    const userId = userDoc.id;
    const { id: postId } = await props.params;

    const postRef = adminDb.collection("posts").doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) return NextResponse.json({ message: "글을 찾을 수 없습니다." }, { status: 404 });

    const postData = doc.data();
    const likedUsers = postData?.likedUsers || [];
    const isAlreadyLiked = likedUsers.includes(userId);

    if (isAlreadyLiked) {
      await postRef.update({
        likedUsers: FieldValue.arrayRemove(userId),
        likeCount: FieldValue.increment(-1)
      });
      return NextResponse.json({ message: "좋아요 취소", liked: false });
    } else {
      await postRef.update({
        likedUsers: FieldValue.arrayUnion(userId),
        likeCount: FieldValue.increment(1)
      });
      return NextResponse.json({ message: "좋아요 성공", liked: true });
    }
  } catch (error) {
    console.error("🔥 좋아요 API 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
