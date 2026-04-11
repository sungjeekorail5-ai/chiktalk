import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 비밀번호 유효성 검사
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!pwRegex.test(newPassword)) {
      return NextResponse.json(
        { message: "비밀번호는 영문+숫자+특수문자 포함 8~20자여야 합니다." },
        { status: 400 }
      );
    }

    // 토큰으로 passwordResets 컬렉션에서 검색
    const snapshot = await adminDb.collection("passwordResets")
      .where("token", "==", token)
      .where("used", "==", false)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "유효하지 않거나 이미 사용된 링크입니다." }, { status: 400 });
    }

    const resetDoc = snapshot.docs[0];
    const resetData = resetDoc.data();

    // 만료 확인
    if (resetData.expiresAt < Date.now()) {
      return NextResponse.json({ message: "링크가 만료되었습니다. 다시 요청해주세요." }, { status: 400 });
    }

    // 비밀번호 해싱 후 업데이트
    const newHash = await hashPassword(newPassword);
    await adminDb.collection("users").doc(resetData.userId).update({
      passwordHash: newHash,
    });

    // 토큰 사용 처리
    await resetDoc.ref.update({ used: true });

    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다!" });
  } catch (error) {
    console.error("비밀번호 재설정 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
