import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";

// 💡 Cloud Function을 통해 비밀번호 재설정 (모바일 앱과 동일한 플로우)
const CLOUD_FUNCTION_URL =
  "https://asia-northeast3-tristan-archive.cloudfunctions.net/resetPassword";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ message: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 비밀번호 유효성 검사 (서버 측 이중 검증)
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!pwRegex.test(newPassword)) {
      return NextResponse.json(
        { message: "비밀번호는 영문+숫자+특수문자 포함 8~20자여야 합니다." },
        { status: 400 }
      );
    }

    // 서버에서 bcrypt 해싱 후 Cloud Function에 전달
    const newPasswordHash = await hashPassword(newPassword);

    const cfResponse = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { email, code, newPasswordHash } }),
    });

    const cfResult = await cfResponse.json();

    if (cfResult.error) {
      const cfError = cfResult.error;
      // Cloud Function 에러 상태에 따라 사용자에게 명확한 메시지 전달
      let message = "재설정에 실패했습니다.";
      switch (cfError.status) {
        case "NOT_FOUND":
          message = "재설정 요청 기록이 없습니다. 인증번호를 다시 요청해주세요.";
          break;
        case "ALREADY_EXISTS":
          message = "이미 사용된 인증번호입니다. 다시 요청해주세요.";
          break;
        case "DEADLINE_EXCEEDED":
          message = "인증번호가 만료되었습니다. 다시 요청해주세요.";
          break;
        case "PERMISSION_DENIED":
          message = "인증번호가 일치하지 않습니다.";
          break;
      }
      return NextResponse.json({ message }, { status: 400 });
    }

    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다!" });
  } catch (error) {
    console.error("비밀번호 재설정 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
