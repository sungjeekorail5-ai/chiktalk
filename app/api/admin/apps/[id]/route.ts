import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

// 🗑️ [DELETE] 앱 삭제 API
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 💡 [핵심] 최신 Next.js 문법에 맞게 await로 params를 기다려줍니다!
    const { id } = await params; 
    
    await adminDb.collection("apps").doc(id).delete();
    return NextResponse.json({ success: true, message: "삭제 완료" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "삭제 실패" }, { status: 500 });
  }
}

// 📝 [PATCH] 앱 정보 수정 API
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 💡 [핵심] 여기도 마찬가지로 await 추가!
    const { id } = await params;
    const body = await req.json();
    
    // 프론트에서 보낸 데이터(...body)를 그대로 파이어베이스에 업데이트
    await adminDb.collection("apps").doc(id).update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: "수정 완료" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "수정 실패" }, { status: 500 });
  }
}