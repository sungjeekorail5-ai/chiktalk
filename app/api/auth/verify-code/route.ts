import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 🔍 프론트엔드에서 'email'로 보내기로 했으므로 변수명 추출을 맞춥니다.
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { error: "이메일과 인증번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 🔍 문서 ID로 찾는 대신, 해당 이메일의 최신 인증 정보를 쿼리로 찾습니다.
    // (addDoc을 사용하면 문서 ID가 랜덤으로 생성되기 때문입니다.)
    const snapshot = await adminDb
      .collection("emailVerifications")
      .where("email", "==", email)
      .where("code", "==", code)
      .where("verified", "==", false)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "인증번호가 올바르지 않거나 이미 확인되었습니다." },
        { status: 400 }
      );
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // 1. 만료 시간 체크
    if (Date.now() > data.expiresAt) {
      return NextResponse.json(
        { error: "인증번호가 만료되었습니다. 다시 발송해주세요." },
        { status: 400 }
      );
    }

    // 2. 인증 성공 처리 (해당 문서 업데이트)
    await doc.ref.update({
      verified: true,
      verifiedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: "이메일 인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("인증 확인 에러:", error);
    return NextResponse.json(
      { error: "인증번호 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}