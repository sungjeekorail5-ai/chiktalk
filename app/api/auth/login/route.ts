import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();

    // 💡 [추가] 비회원 로그인 하이패스 로직!
    // 만약 프론트엔드 비회원 버튼에서 id를 'guest' 같은 특수 값으로 보낸다면?
    if (id === "guest") {
      const cookieStore = await cookies();
      cookieStore.set("session", "guest_session", { // 가짜 세션 ID 부여
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 비회원은 깔끔하게 1일만 유지
        path: "/",
      });
      return NextResponse.json({ message: "비회원 입장 완료! 🚂" }, { status: 200 });
    }

    // --- 여기서부터는 기존 정식 회원 로그인 로직 ---
    if (!id || !password) {
      return NextResponse.json({ message: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("username", "==", id).get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "존재하지 않는 아이디입니다." }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordMatch = await bcrypt.compare(password, userData.passwordHash);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session", userDoc.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ message: "로그인 성공 🚂" }, { status: 200 });

  } catch (error) {
    console.error("로그인 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}