import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    const email = String(body.email || body.korailEmail || "").trim().toLowerCase();
    
    // 💡 [추가] 닉네임 필드 가져오기
    const nickname = String(body.nickname || "").trim();

    // 💡 [수정] 필수 입력값에 닉네임 추가
    if (!username || !password || !email || !nickname) {
      return NextResponse.json(
        { message: "아이디, 비밀번호, 닉네임, korail 이메일을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (!email.endsWith("@korail.com")) {
      return NextResponse.json(
        { message: "@korail.com 이메일만 가입할 수 있습니다." },
        { status: 400 }
      );
    }

    // 💡 [추가] 닉네임 길이 제한 (2자~10자 사이가 적당합니다)
    if (nickname.length < 2 || nickname.length > 10) {
      return NextResponse.json(
        { message: "닉네임은 2자 이상 10자 이하로 입력해주세요." },
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

    // 🔍 인증 완료된 내역 찾기
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

    // 💡 [추가] 닉네임 중복 체크 (DB에서 같은 닉네임이 있는지 확인)
    const nicknameCheck = await adminDb.collection("users").where("nickname", "==", nickname).get();
    if (!nicknameCheck.empty) {
      return NextResponse.json(
        { message: "이미 사용 중인 닉네임입니다." },
        { status: 409 }
      );
    }

    // 아이디 중복 체크
    const userRef = adminDb.collection("users").doc(username);
    const existing = await userRef.get();

    if (existing.exists) {
      return NextResponse.json(
        { message: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 암호화
    const passwordHash = await hashPassword(password);

    // 유저 정보 저장
    await userRef.set({
      username,
      nickname, // 💡 [추가] 닉네임 저장
      korailEmail: email,
      passwordHash,
      korailVerified: true,
      createdAt: new Date().toISOString(),
    });

    // 인증 문서 삭제
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