import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");
    
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    // 👑 [슈퍼 관리자 아이디 설정]
    const ADMIN_ID = "sungjee90"; 

    // 💡 권한 검사: 성지님 아이디가 아니면 절대 삭제 불가!
    if (!session || session !== ADMIN_ID) {
      return NextResponse.json(
        { message: "성지님(sungjee90)만 삭제 권한이 있습니다! 🧐" }, 
        { status: 403 }
      );
    }

    if (!postId) {
      return NextResponse.json({ message: "삭제할 글 ID가 없습니다." }, { status: 400 });
    }

    // 🔥 파이어스토어에서 해당 문서 삭제
    await adminDb.collection("posts").doc(postId).delete();

    return NextResponse.json({ message: "글이 삭제되었습니다! 🚀" }, { status: 200 });

  } catch (error) {
    console.error("삭제 중 오류 발생:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}