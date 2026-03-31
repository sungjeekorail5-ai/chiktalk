import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    // 프론트엔드에서 변경한 키값('email')과 기존 키값('korailEmail')을 모두 안전하게 지원합니다.
    const email = String(body.email || body.korailEmail || "").trim().toLowerCase();

    if (!username || !password || !email) {
      return NextResponse.json(
        { message: "아이디, 비밀번호, korail 이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!email.endsWith("@korail.com")) {
      return NextResponse.json(
        { message: "@korail.com 이메일만 가입할 수 있습니다." },
        { status: 400 }
      );
    }

    if (username.length < 4) {
      return NextResponse.json(
        { message: "아이디는 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 🔍 수정된 부분: 문서 ID가 아닌 쿼리로 '인증 완료된' 최신 내역 찾기
    const verificationSnap = await adminDb
      .collection("emailVerifications")
      .where("email", "==", email)
      .where("verified", "==", true)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (verificationSnap.empty) {
      return NextResponse.json(
        { message: "먼저 이메일 인증을 완료해주세요." },
        { status: 400 }
      );
    }

    const verificationDoc = verificationSnap.docs[0];

    // 아이디 중복 체크
    const userRef = adminDb.collection("users").doc(username);
    const existing = await userRef.get();

    if (existing.exists) {
      return NextResponse.json(
        { message: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 암호화 (기존 커스텀 함수 사용)
    const passwordHash = await hashPassword(password);

    // 유저 정보 저장
    await userRef.set({
      username,
      korailEmail: email,
      passwordHash,
      korailVerified: true,
      createdAt: new Date().toISOString(),
    });

    // 🔍 사용이 끝난 인증 문서 깔끔하게 삭제
    await verificationDoc.ref.delete();

    return NextResponse.json({
      message: "회원가입 완료",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}