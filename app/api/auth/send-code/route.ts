import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.endsWith("@korail.com")) {
      return NextResponse.json(
        { error: "코레일 이메일(@korail.com)만 사용 가능합니다." },
        { status: 400 }
      );
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Admin SDK의 Firestore 방식 (collection, addDoc 대신 더 직관적인 collection().add())
    await adminDb.collection("emailVerifications").add({
      email,
      code: verificationCode,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Date.now() + 10 * 60 * 1000, 
      verified: false,
    });

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ success: true, message: "인증번호가 발송되었습니다." });
  } catch (error: any) {
    console.error("인증번호 발송 에러:", error);
    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}