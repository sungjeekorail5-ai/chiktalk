import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    // 1️⃣ 게시글 목록 가져오기 (최신순)
    const snapshot = await adminDb
      .collection("posts")
      .orderBy("createdAt", "desc")
      .get();

    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // 💡 Firestore Timestamp → ISO 문자열 변환 (클라이언트 호환)
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      };
    });

    // 2️⃣ 💡 [핵심] 현재 로그인한 유저 정보 전달
    const userId = session || ""; 
    const isLoggedIn = !!session && session !== "guest_session";

    return NextResponse.json({
      posts,
      isLoggedIn,
      userId, // 👈 화면(page.tsx)에서 이걸 보고 isAdmin을 판단합니다.
    }, { status: 200 });

  } catch (error) {
    console.error("게시판 목록 로딩 에러:", error);
    return NextResponse.json({ message: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}