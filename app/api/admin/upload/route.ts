import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    // 💡 이제 FormData(파일)가 아니라 가벼운 JSON(텍스트)만 받습니다.
    const data = await req.json();
    
    // DB에 저장할 앱 정보 조합
    const newApp = {
      title: data.title,
      description: data.description,
      detailedDescription: data.detailedDescription || "", // 💡 [추가] 상세 설명 받기!
      version: data.version,
      requireLogin: data.requireLogin,
      fileUrl: data.fileUrl, 
      iconUrl: data.iconUrl || "",
      screenshotUrls: data.screenshotUrls || [], // 💡 [추가] 스크린샷 배열 받기!
      createdAt: new Date().toISOString(),
    };

    // Firestore DB 'apps' 컬렉션에 저장
    await adminDb.collection("apps").add(newApp);

    return NextResponse.json({ success: true, message: "업로드 성공" });
  } catch (error) {
    console.error("DB 저장 에러:", error);
    return NextResponse.json({ success: false, message: "서버 오류 발생" }, { status: 500 });
  }
}