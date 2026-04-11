import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const ADMIN_ID = "sungjee90";

// 💡 관리자 검증 헬퍼
async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session || session === "guest_session") return false;

  const userDoc = await adminDb.collection("users").doc(session).get();
  return userDoc.exists && userDoc.id === ADMIN_ID;
}

// 🗑️ [DELETE] 앱 삭제 API (관리자만)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, message: "관리자만 삭제할 수 있습니다." }, { status: 403 });
    }

    const { id } = await params;
    await adminDb.collection("apps").doc(id).delete();
    return NextResponse.json({ success: true, message: "삭제 완료" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "삭제 실패" }, { status: 500 });
  }
}

// 📝 [PATCH] 앱 정보 수정 API (관리자만)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, message: "관리자만 수정할 수 있습니다." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await adminDb.collection("apps").doc(id).update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: "수정 완료" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "수정 실패" }, { status: 500 });
  }
}
