import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyPassword } from "@/lib/password";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();

    // 💡 [비회원 로그인] 하이패스 로직
    if (id === "guest") {
      const cookieStore = await cookies();
      cookieStore.set("session", "guest_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, 
        path: "/",
      });
      
      // 💡 비회원일 때도 기본 닉네임을 내려줍니다.
      return NextResponse.json({ 
        message: "비회원 입장 완료! 🚂",
        nickname: "치포치포(게스트)" 
      }, { status: 200 });
    }

    // --- 정식 회원 로그인 로직 ---
    if (!id || !password) {
      return NextResponse.json({ message: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("username", "==", id).get();

    // 💡 아이디 없음 / 비번 틀림 모두 같은 메시지 (계정 열거 방지)
    if (snapshot.empty) {
      return NextResponse.json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 비밀번호 체크
    const isPasswordMatch = await verifyPassword(password, userData.passwordHash);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 세션 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set("session", userDoc.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // 💡 [핵심] 로그인 성공 시 DB에 저장된 nickname + korailVerified를 프론트엔드로 전달합니다!
    return NextResponse.json({
      message: "로그인 성공 🚂",
      nickname: userData.nickname || id,
      korailVerified: userData.korailVerified ?? false,
    }, { status: 200 });

  } catch (error) {
    console.error("로그인 에러:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}