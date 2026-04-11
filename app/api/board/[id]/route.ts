import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const ADMIN_ID = "sungjee90";

// 💡 세션 검증 헬퍼 함수
async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session || session === "guest_session") return null;

  const userDoc = await adminDb.collection("users").doc(session).get();
  if (!userDoc.exists) return null;

  return { id: userDoc.id, ...userDoc.data() };
}

// 🗑️ DELETE: 게시글 삭제 (본인 글 또는 관리자만)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await props.params;
    const postDoc = await adminDb.collection("posts").doc(id).get();
    if (!postDoc.exists) {
      return NextResponse.json({ message: "글을 찾을 수 없습니다." }, { status: 404 });
    }

    // 💡 본인 글이거나 관리자만 삭제 가능
    const postData = postDoc.data();
    if (postData?.authorId !== user.id && user.id !== ADMIN_ID) {
      return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
    }

    await adminDb.collection("posts").doc(id).delete();
    return NextResponse.json({ message: "삭제 완료" });
  } catch (error) {
    console.error("🔥 글 삭제 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

// 💬 POST: 댓글 및 대댓글 작성 (+ 숫자 연동)
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await props.params;
    const { content, parentId } = await req.json();

    if (!content) return NextResponse.json({ message: "내용 없음" }, { status: 400 });

    const postRef = adminDb.collection("posts").doc(id);

    // 1. 댓글 저장 (세션에서 확인된 유저 정보 사용)
    await postRef.collection("comments").add({
      content: content,
      authorId: user.id,
      authorNickname: (user as any).nickname || "익명 승객",
      parentId: parentId || null,
      createdAt: FieldValue.serverTimestamp(),
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

// ✏️ PUT: 게시글 수정 (본인 글 또는 관리자만)
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await props.params;
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    // 💡 본인 글이거나 관리자만 수정 가능
    const postDoc = await adminDb.collection("posts").doc(id).get();
    if (!postDoc.exists) {
      return NextResponse.json({ message: "글을 찾을 수 없습니다." }, { status: 404 });
    }

    const postData = postDoc.data();
    if (postData?.authorId !== user.id && user.id !== ADMIN_ID) {
      return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
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
