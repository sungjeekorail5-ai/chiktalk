import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await props.params;
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

    const postRef = adminDb.collection("posts").doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) return NextResponse.json({ message: "글을 찾을 수 없습니다." }, { status: 404 });

    const postData = doc.data();
    // 💡 좋아요를 누른 유저 ID 목록을 배열로 관리합니다.
    const likedUsers = postData?.likedUsers || [];
    const isAlreadyLiked = likedUsers.includes(userId);

    if (isAlreadyLiked) {
      // 1. 이미 눌렀다면? 취소 (배열에서 제거 + 숫자 -1)
      await postRef.update({
        likedUsers: FieldValue.arrayRemove(userId),
        likeCount: FieldValue.increment(-1)
      });
      return NextResponse.json({ message: "좋아요 취소", liked: false });
    } else {
      // 2. 처음 누른다면? 추가 (배열에 추가 + 숫자 +1)
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