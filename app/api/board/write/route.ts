import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin"; // 💡 스토리지 임포트 확인!
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. 로그인 확인
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

    const sessionDoc = await adminDb.collection("sessions").doc(sessionCookie).get();
    if (!sessionDoc.exists) return NextResponse.json({ message: "세션 만료" }, { status: 401 });
    const userData = sessionDoc.data();

    // 2. FormData 파싱
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFiles = formData.getAll("images") as File[]; // 'images' 키로 담긴 파일들

    if (!title || !content) return NextResponse.json({ message: "데이터 부족" }, { status: 400 });

    // 📸 3. Firebase Storage에 이미지 업로드 처리
    const imageUrls: string[] = [];
    
    if (imageFiles.length > 0) {
      const bucket = adminStorage.bucket();

      for (const file of imageFiles) {
        // 파일명 고유하게 만들기 (시간값 + 랜덤 + 원본이름)
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
        const fileRef = bucket.file(`posts/${fileName}`);

        // Buffer로 변환하여 업로드
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fileRef.save(buffer, {
          metadata: { contentType: file.type },
        });

        // 💡 중요: 업로드 후 '공개 다운로드 URL' 가져오기
        // Vercel 환경에서는 getSignedUrl보다 이게 더 간편하고 비용이 적게 듭니다.
        await fileRef.makePublic(); 
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
        imageUrls.push(publicUrl);
      }
    }

    // 4. Firestore에 글 데이터 저장 (+ 이미지 URL 배열)
    const docRef = await adminDb.collection("posts").add({
      title,
      content,
      authorId: userData?.uid,
      authorNickname: userData?.nickname,
      createdAt: new Date().toISOString(),
      views: 0,
      commentCount: 0,
      likeCount: 0,
      likedUsers: [],
      images: imageUrls, // 💡 여기에 URL 배열이 들어갑니다!
    });

    return NextResponse.json({ message: "등록 완료", id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("🔥 글 쓰기 API 에러:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}