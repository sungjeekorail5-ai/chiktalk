import { NextResponse } from "next/server";

// 💡 Cloud Function을 통해 이메일 발송 (Vercel에서 직접 SMTP 사용 시 Gmail 차단 이슈 해결)
const CLOUD_FUNCTION_URL =
  "https://asia-northeast3-tristan-archive.cloudfunctions.net/sendPasswordResetCode";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });
    }

    // Cloud Function 호출 (유저 존재 확인 + 코드 생성 + Firestore 저장 + 메일 발송을 Cloud Function이 처리)
    const cfResponse = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { email } }),
    });

    const cfResult = await cfResponse.json();

    if (cfResult.error) {
      console.error("Cloud Function 에러:", cfResult.error);
      return NextResponse.json(
        { message: "인증번호 발송 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 보안상 유저 존재 여부와 관계없이 동일 성공 응답 (이메일 열거 공격 방지)
    return NextResponse.json({ message: "인증번호가 발송되었습니다." });
  } catch (error) {
    console.error("비밀번호 찾기 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
