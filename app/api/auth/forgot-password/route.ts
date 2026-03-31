import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/mailer"; // 기존에 만든 메일 발송 함수

export async function POST(req: Request) {
  const { email } = await req.json();
  
  // 1. 해당 이메일의 유저가 있는지 확인
  const userSnap = await adminDb.collection("users").where("email", "==", email).get();
  
  if (userSnap.empty) {
    return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  // 2. 임시 토큰 생성 (실제로는 보안을 위해 DB에 저장하고 만료시간을 둡니다)
  const resetToken = Buffer.from(email).toString('base64'); 
  const resetLink = `http://localhost:3000/login/reset-password?token=${resetToken}`;

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
}