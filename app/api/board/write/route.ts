import { NextResponse } from "next/server";
import { adminDb, adminStorage, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. 로그인 확인 및 세션 검증
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    
    // 🚨 세션이 아예 없거나, 비회원(게스트)이면 쫓아냅니다.
    if (!sessionCookie || sessionCookie === "guest_session") {
      return NextResponse.json({ message: "정식 탑승객만 글을 쓸 수 있습니다! 🎫" }, { status: 401 });
    }

    // 💡 sessionCookie가 이제 users 컬렉션의 문서 ID입니다.
    const userDoc = await adminDb.collection("users").doc(sessionCookie).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ message: "세션이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
    }
    
    const userData = userDoc.data();

    // 2. FormData 파싱
    const formData = await req.formData();
    
    // 💡 카테고리 정보 (기본값 'free')
    const category = (formData.get("category") as string) || "free";
    
    // 💡 [공지사항 추가] 폼에서 값을 받고, 서버에서도 한 번 더 sungjee90인지 검증합니다.
    const isNotice = (formData.get("isNotice") === "true") && (userDoc.id === "sungjee90");
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFiles = formData.getAll("images") as File[]; 

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
        await fileRef.makePublic(); 
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
        imageUrls.push(publicUrl);
      }
    }

    // 4. Firestore에 글 데이터 저장 (+ 이미지 URL 배열, 카테고리, 공지여부)
    const docRef = await adminDb.collection("posts").add({
      category,
      isNotice, // 💡 공지사항 필드 저장
      title,
      content,
      authorId: userDoc.id, 
      authorNickname: userData?.nickname || "익명",
      createdAt: FieldValue.serverTimestamp(),
      views: 0,
      commentCount: 0,
      likeCount: 0,
      likedUsers: [],
      images: imageUrls, 
    });

    return NextResponse.json({ message: "등록 완료", id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("🔥 글 쓰기 API 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}