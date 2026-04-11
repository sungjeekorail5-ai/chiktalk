import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });
    }

    // 1. 해당 이메일의 유저가 있는지 확인
    const userSnap = await adminDb.collection("users").where("korailEmail", "==", email).get();

    if (userSnap.empty) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 2. 임시 토큰 생성 + 만료시간 저장 (암호학적으로 안전한 랜덤 토큰)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const userId = userSnap.docs[0].id;

    await adminDb.collection("passwordResets").doc(email).set({
      token: resetToken,
      userId,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10분
      used: false,
    });

    // 요청 URL에서 도메인 자동 추출 (로컬/배포 모두 대응)
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "https://chiktalk.vercel.app";
    const resetLink = `${origin}/login/reset-password?token=${resetToken}`;

    // 3. 메일 발송
    await sendEmail({
      to: email,
      subject: "[칙칙톡톡] 비밀번호 재설정 안내입니다.",
      html: `
        <h1>비밀번호를 잊으셨나요?</h1>
        <p>아래 링크를 클릭하여 새로운 비밀번호를 설정하세요.</p>
        <a href="${resetLink}" style="padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none;">비밀번호 재설정하기</a>
      `,
    });

    return NextResponse.json({ message: "발송 성공" });
  } catch (error) {
    console.error("비밀번호 찾기 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
