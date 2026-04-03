import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 💡 AuthContext가 POST로 부르니까, 여기도 POST로 대답해야 합니다!
export async function POST() {
  // 1. 쿠키(신분증) 완벽하게 파기 💥
  const cookieStore = await cookies();
  cookieStore.delete("session");
  
  // 2. AuthContext가 알아서 화면을 이동시켜주니까, 
  // 서버는 그냥 "쿠키 잘 지웠어~" 하고 OK 사인만 보내주면 됩니다.
  return NextResponse.json({ message: "쿠키 파기 완료" }, { status: 200 });
}