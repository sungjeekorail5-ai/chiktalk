import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const ADMIN_ID = "sungjee90";

export async function POST(req: Request) {
  try {
    // 💡 관리자 인증 체크
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session || session === "guest_session") {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(session).get();
    if (!userDoc.exists || userDoc.id !== ADMIN_ID) {
      return NextResponse.json({ success: false, message: "관리자만 앱을 업로드할 수 있습니다." }, { status: 403 });
    }

    const data = await req.json();

    const newApp = {
      title: data.title,
      description: data.description,
      detailedDescription: data.detailedDescription || "",
      version: data.version,
      requireLogin: data.requireLogin,
      fileUrl: data.fileUrl,
      iconUrl: data.iconUrl || "",
      screenshotUrls: data.screenshotUrls || [],
      createdAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("apps").add(newApp);

    return NextResponse.json({ success: true, message: "업로드 성공" });
  } catch (error) {
    console.error("DB 저장 에러:", error);
    return NextResponse.json({ success: false, message: "서버 오류 발생" }, { status: 500 });
  }
}
