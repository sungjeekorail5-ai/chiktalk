import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore"; // 💡 숫자 증감을 위해 추가

// 🗑️ DELETE: 게시글 삭제
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    await adminDb.collection("posts").doc(id).delete();
    return NextResponse.json({ message: "삭제 완료" });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

// 💬 POST: 댓글 및 대댓글 작성 (+ 숫자 연동)
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const { userId, nickname, content, parentId } = await req.json();

    if (!content) return NextResponse.json({ message: "내용 없음" }, { status: 400 });

    const postRef = adminDb.collection("posts").doc(id);

    // 1. 댓글 저장
    await postRef.collection("comments").add({
      content: content,
      authorId: userId || "unknown_user",         
      authorNickname: nickname || "익명 승객",      
      parentId: parentId || null,                 
      createdAt: new Date().toISOString(),
    });

    // 💡 2. 게시글의 댓글 숫자(commentCount) 1 증가!
    await postRef.update({
      commentCount: FieldValue.increment(1)
    });

    return NextResponse.json({ message: "작성 완료" }, { status: 200 });
  } catch (error) {
    console.error("🔥 댓글 작성 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

// ✏️ PUT: 게시글 수정
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    await adminDb.collection("posts").doc(id).update({
      title,
      content,
    });

    return NextResponse.json({ message: "수정 완료" }, { status: 200 });
  } catch (error) {
    console.error("🔥 글 수정 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}