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
    const icon = formData.get("icon") as File | null; // 💡 여기서 null 체크 들어갑니다.

    if (!file || !title) {
      return NextResponse.json({ message: "앱 파일과 제목은 필수입니다! 😅" }, { status: 400 });
    }

    // --- 1️⃣ 앱 설치 파일 업로드 ---
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = adminStorage.bucket().file(`apps/${fileName}`);
    
    await fileRef.save(fileBuffer, { contentType: file.type });
    const [fileUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    // --- 2️⃣ 아이콘 업로드 (null이면 건너뜁니다!) ---
    let iconUrl = ""; 
    
    if (icon && icon.size > 0) { // 💡 파일이 진짜 존재하고 크기가 0보다 클 때만!
      try {
        const iconBuffer = Buffer.from(await icon.arrayBuffer());
        const iconName = `${Date.now()}_icon_${icon.name}`;
        const iconRef = adminStorage.bucket().file(`icons/${iconName}`);
        
        await iconRef.save(iconBuffer, { contentType: icon.type });
        const [signedIconUrl] = await iconRef.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });
        iconUrl = signedIconUrl;
      } catch (iconError) {
        console.error("아이콘 업로드 실패 (무시하고 진행):", iconError);
        // 아이콘 실패해도 앱 업로드는 계속 진행하게 냅둡니다.
      }
    }

    // --- 3️⃣ 파이어스토어 DB 저장 ---
    const newApp = {
      title,
      description,
      version,
      requireLogin,
      fileUrl,
      iconUrl, // 아이콘 없으면 빈 문자열 저장
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("apps").add(newApp);

    return NextResponse.json({ 
      message: "성공적으로 업로드되었습니다! 🚂💨", 
      id: docRef.id 
    }, { status: 200 });

  } catch (error) {
    console.error("Upload Global Error:", error);
    return NextResponse.json({ message: "서버 내부 오류가 발생했습니다. ㅠㅠ" }, { status: 500 });
  }
}