import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const version = formData.get("version") as string;
    const requireLogin = formData.get("requireLogin") === "true";
    const file = formData.get("file") as File;
    const icon = formData.get("icon") as File | null; // 💡 아이콘은 선택사항

    if (!file || !title) {
      return NextResponse.json({ message: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 1️⃣ 앱 설치 파일 업로드 (.apk 등)
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = adminStorage.bucket().file(`apps/${fileName}`);
    
    await fileRef.save(fileBuffer, { contentType: file.type });
    const [fileUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // 사실상 영구 주소
    });

    // 2️⃣ 💡 아이콘 이미지 업로드 (있을 경우만)
    let iconUrl = ""; // 기본값은 빈 문자열 (나중에 앱 보관함에서 이모지로 대체 가능)
    
    if (icon) {
      const iconBuffer = Buffer.from(await icon.arrayBuffer());
      const iconName = `${Date.now()}_icon_${icon.name}`;
      const iconRef = adminStorage.bucket().file(`icons/${iconName}`);
      
      await iconRef.save(iconBuffer, { contentType: icon.type });
      const [signedIconUrl] = await iconRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      iconUrl = signedIconUrl;
    }

    // 3️⃣ 🔥 파이어스토어 DB에 저장
    const newApp = {
      title,
      description,
      version,
      requireLogin,
      fileUrl,
      iconUrl, // 💡 이미지 주소 추가!
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("apps").add(newApp);

    return NextResponse.json({ 
      message: "성공", 
      id: docRef.id,
      data: newApp 
    }, { status: 200 });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "서버 업로드 오류" }, { status: 500 });
  }
}