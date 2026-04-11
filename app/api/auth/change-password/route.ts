import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyPassword, hashPassword } from "@/lib/password";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "현재 비밀번호와 새 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사 (영문+숫자+특수문자 8~20자) - 앱과 동일한 규칙
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!pwRegex.test(newPassword)) {
      return NextResponse.json(
        { message: "비밀번호는 영문+숫자+특수문자 포함 8~20자여야 합니다." },
        { status: 400 }
      );
    }

    // 세션 쿠키에서 유저 ID 가져오기
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session || session === "guest_session") {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // Firestore에서 유저 정보 조회
    const userDoc = await adminDb.collection("users").doc(session).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;

    // 현재 비밀번호 확인
    const isMatch = await verifyPassword(currentPassword, userData.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "현재 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 새 비밀번호 해싱 후 업데이트
    const newHash = await hashPassword(newPassword);
    await adminDb.collection("users").doc(session).update({
      passwordHash: newHash,
    });

    return NextResponse.json(
      { message: "비밀번호가 성공적으로 변경되었습니다!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("비밀번호 변경 에러:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
