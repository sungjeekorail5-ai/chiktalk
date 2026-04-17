import { NextResponse } from "next/server";

// 💡 Cloud Function을 통해 이메일 발송 (Vercel에서 직접 SMTP 사용 시 Gmail 차단 이슈 해결)
const CLOUD_FUNCTION_URL =
  "https://asia-northeast3-tristan-archive.cloudfunctions.net/sendVerificationCode";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.endsWith("@korail.com")) {
      return NextResponse.json(
        { error: "코레일 이메일(@korail.com)만 사용 가능합니다." },
        { status: 400 }
      );
    }

    // Cloud Function 호출 (Firestore 저장 + 이메일 발송을 Cloud Function이 처리)
    const cfResponse = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { email } }),
    });

    const cfResult = await cfResponse.json();

    if (cfResult.error) {
      console.error("Cloud Function 에러:", cfResult.error);
      return NextResponse.json(
        { error: "메일 발송 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "인증번호가 발송되었습니다." });
  } catch (error) {
    console.error("인증번호 발송 에러:", error);
    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}