import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // 1. 로그인 세션(쿠키) 삭제
  const cookieStore = await cookies();
  cookieStore.delete("session");
  
  // 2. 💡 [핵심] 0.0.0.0 에러 방지: 현재 접속한 진짜 도메인 주소를 기준으로 안전하게 홈("/")으로 돌려보냄
  return NextResponse.redirect(new URL("/", request.url));
}