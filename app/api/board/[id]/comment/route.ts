import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

// ✏️ PUT: 댓글 수정
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await props.params;
    const { commentId, content } = await req.json();

    if (!commentId || !content) {
      return NextResponse.json({ message: "데이터 부족" }, { status: 400 });
    }

    await adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
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

// 🗑️ DELETE: 댓글 삭제 (+ 숫자 연동)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await props.params;
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ message: "댓글 ID 없음" }, { status: 400 });
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