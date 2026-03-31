import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// 🗑️ DELETE: 게시글 삭제
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    await adminDb.collection("posts").doc(id).delete();
    // (참고: 진짜 완벽하게 하려면 달린 댓글들도 같이 지워야 하지만, 일단 글만 지우겠습니다!)
    return NextResponse.json({ message: "삭제 완료" });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

// 💬 POST: 댓글 작성
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const { author, content } = await req.json();

    // 게시글 안에 'comments'라는 하위 폴더(컬렉션)를 만들어서 저장합니다.
    await adminDb.collection("posts").doc(id).collection("comments").add({
      author,
      content,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "댓글 작성 완료" });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}