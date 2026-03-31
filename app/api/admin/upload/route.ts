import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    // 💡 원래 body = await req.json() 대신 formData() 사용
    const data = await req.formData();
    const file = data.get("file") as File;
    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const version = data.get("version") as string;
    const requireLogin = data.get("requireLogin") === "true";

    // 1. 필수 값 체크
    if (!file || !title || !description || !version) {
      return NextResponse.json(
        { message: "파일을 포함한 모든 정보를 입력해주세요." },
        { status: 400 }
      );
    }

    // 2. Firebase Storage에 파일 업로드 로직 추가
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;
    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(`apps/${fileName}`);

    // 파일 저장
    await storageFile.save(buffer, {
      contentType: file.type || "application/octet-stream",
    });

    // 다운로드 가능한 서명된 URL 생성 (유효기간 길게 설정 가능)
    const [fileUrl] = await storageFile.getSignedUrl({
      action: "read",
      expires: "01-01-2099", // 아주 넉넉하게 설정
    });

    // 3. Firestore 'apps' 컬렉션에 데이터 저장
    const newAppRef = await adminDb.collection("apps").add({
      title,
      description,
      version,
      requireLogin,
      fileUrl, // 💡 실제 Storage 주소 저장
      fileName,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "앱 등록 성공",
      id: newAppRef.id,
    });
    
  } catch (error) {
    console.error("앱 등록 에러:", error);
    return NextResponse.json(
      { message: "앱 등록 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}