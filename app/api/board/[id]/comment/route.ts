import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const ADMIN_ID = "sungjee90";

// 💡 세션 검증 헬퍼
async function getSessionUserId() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session || session === "guest_session") return null;

  const userDoc = await adminDb.collection("users").doc(session).get();
  if (!userDoc.exists) return null;

  return userDoc.id;
}

// ✏️ PUT: 댓글 수정 (본인 댓글 또는 관리자만)
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: postId } = await props.params;
    const { commentId, content } = await req.json();

    if (!commentId || !content) {
      return NextResponse.json({ message: "데이터 부족" }, { status: 400 });
    }

    // 💡 본인 댓글인지 확인
    const commentDoc = await adminDb
      .collection("posts").doc(postId)
      .collection("comments").doc(commentId)
      .get();

    if (!commentDoc.exists) {
      return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (commentDoc.data()?.authorId !== userId && userId !== ADMIN_ID) {
      return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
    }

    await adminDb
      .collection("posts").doc(postId)
      .collection("comments").doc(commentId)
      .update({
        content,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ message: "댓글 수정 완료" }, { status: 200 });
  } catch (error) {
    console.error("🔥 댓글 수정 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

// 🗑️ DELETE: 댓글 삭제 (본인 댓글 또는 관리자만 + 숫자 연동)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: postId } = await props.params;
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ message: "댓글 ID 없음" }, { status: 400 });
    }

    // 💡 본인 댓글인지 확인
    const commentDoc = await adminDb
      .collection("posts").doc(postId)
      .collection("comments").doc(commentId)
      .get();

    if (!commentDoc.exists) {
      return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (commentDoc.data()?.authorId !== userId && userId !== ADMIN_ID) {
      return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
    }

    const postRef = adminDb.collection("posts").doc(postId);

    // 1. 댓글 삭제
    await postRef.collection("comments").doc(commentId).delete();

    // 💡 2. 게시글의 댓글 숫자(commentCount) 1 감소!
    await postRef.update({
      commentCount: FieldValue.increment(-1)
    });

    return NextResponse.json({ message: "댓글 삭제 완료" }, { status: 200 });
  } catch (error) {
    console.error("🔥 댓글 삭제 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
