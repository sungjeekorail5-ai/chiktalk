import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // 1. 쿠키(신분증) 완벽하게 파기 💥
  const cookieStore = await cookies();
  cookieStore.delete("session");
  
  // 2. AuthContext가 알아서 화면을 이동시켜주니까, 
  return NextResponse.json({ message: "쿠키 파기 완료" }, { status: 200 });
}