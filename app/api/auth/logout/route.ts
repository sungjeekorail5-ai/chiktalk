import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. 쿠키 저장소 불러오기
  const cookieStore = await cookies();
  
  // 2. 'session' 쿠키 삭제 (로그아웃 처리)
  cookieStore.delete("session");

  // 3. 메인 페이지("/")로 강제 이동 (리다이렉트)
  return NextResponse.redirect(new URL("/", request.url));
}