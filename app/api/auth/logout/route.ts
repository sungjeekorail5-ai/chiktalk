import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // 1. 쿠키(신분증) 완벽하게 파기
  const cookieStore = await cookies();
  cookieStore.delete("session");
  
  // 2. 💡 [핵심] 0.0.0.0 에러 방어: 절대 주소 쓰지 말고 강제로 루트 경로("/")로 꽂아버림
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}