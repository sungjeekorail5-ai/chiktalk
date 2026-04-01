import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    // 💡 프론트에서 넘어온 데이터를 받습니다.
    const { title, content, userId, nickname, imageUrl } = await req.json();
    
    // 필수 데이터 확인
    if (!title || !content) {
      return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    // 💡 핵심: 파이어베이스는 undefined를 극도로 싫어합니다.
    // 만약 프론트에서 값이 제대로 안 넘어왔을 때를 대비해 || (기본값) 처리를 완벽하게 해줍니다.
    const postRef = await adminDb.collection("posts").add({
      title: title,
      content: content,
      authorId: userId || "unknown_user",         // 아이디가 없으면 기본값
      authorNickname: nickname || "익명 승객",      // 닉네임이 안 넘어오면 기본값 (에러 방지)
      imageUrl: imageUrl || null,                 // 사진이 없으면 null 처리
      createdAt: new Date().toISOString(),
      views: 0,                                   // 조회수 초기값
    });

    return NextResponse.json({ id: postRef.id }, { status: 200 });
  } catch (error) {
    // 터미널에 어떤 에러인지 정확히 찍어줍니다.
    console.error("🔥 글쓰기 백엔드 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}