import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const ADMIN_ID = "sungjee90";

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    // 💡 세션 검증: 쿠키가 실제 존재하는 유저인지 Firestore에서 확인
    if (!session || session === "guest_session") {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(session).get();
    if (!userDoc.exists) {
      return NextResponse.json({ message: "세션이 만료되었습니다." }, { status: 401 });
    }

    // 👑 관리자만 이 라우트 사용 가능
    if (userDoc.id !== ADMIN_ID) {
      return NextResponse.json(
        { message: "관리자만 삭제 권한이 있습니다!" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ message: "삭제할 글 ID가 없습니다." }, { status: 400 });
    }

    await adminDb.collection("posts").doc(postId).delete();

    return NextResponse.json({ message: "글이 삭제되었습니다!" }, { status: 200 });
  } catch (error) {
    console.error("삭제 중 오류 발생:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
