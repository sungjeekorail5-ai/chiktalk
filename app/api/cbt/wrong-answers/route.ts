// 🚂 코레일 CBT — 오답노트 API
// Firestore 경로: users/{userId}/cbtWrongAnswers/{questionId}

import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session || session === "guest_session") return null;
  return session;
}

// ─── GET: 내 오답 목록 (savedAt 내림차순) ───
export async function GET() {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json(
      { items: [], loggedIn: false },
      { status: 200 }
    );
  }

  try {
    const snap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("cbtWrongAnswers")
      .orderBy("savedAt", "desc")
      .get();

    const items = snap.docs.map((d) => {
      const data = d.data();
      const savedAtRaw = data.savedAt;
      const savedAt =
        savedAtRaw?.toDate?.()?.toISOString() ??
        (typeof savedAtRaw === "string" ? savedAtRaw : null);
      return { id: d.id, ...data, savedAt };
    });
    return NextResponse.json({ items, loggedIn: true }, { status: 200 });
  } catch (e) {
    console.error("🔥 오답노트 로드 에러:", e);
    return NextResponse.json(
      { message: "오답노트를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

// ─── POST: 오답 일괄 저장 (덮어쓰기) ───
export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ saved: 0 }, { status: 200 });
    }

    const colRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("cbtWrongAnswers");
    const batch = adminDb.batch();
    let count = 0;

    for (const item of items) {
      const { id, ...rest } = item;
      if (typeof id !== "string" || !id) continue;
      batch.set(colRef.doc(id), {
        ...rest,
        savedAt: FieldValue.serverTimestamp(),
      });
      count++;
    }

    if (count > 0) await batch.commit();
    return NextResponse.json({ saved: count }, { status: 200 });
  } catch (e) {
    console.error("🔥 오답노트 저장 에러:", e);
    return NextResponse.json({ message: "저장 실패" }, { status: 500 });
  }
}

// ─── DELETE: 단건(?id=) / 일괄(?ids=a,b,c) / 전체(?all=true) ───
export async function DELETE(req: Request) {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const ids = url.searchParams.get("ids");
  const all = url.searchParams.get("all");

  try {
    const colRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("cbtWrongAnswers");

    if (all === "true") {
      const snap = await colRef.get();
      const batch = adminDb.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      if (snap.size > 0) await batch.commit();
      return NextResponse.json({ deleted: snap.size }, { status: 200 });
    }

    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      if (idList.length === 0) {
        return NextResponse.json({ deleted: 0 }, { status: 200 });
      }
      const batch = adminDb.batch();
      for (const i of idList) batch.delete(colRef.doc(i));
      await batch.commit();
      return NextResponse.json({ deleted: idList.length }, { status: 200 });
    }

    if (id) {
      await colRef.doc(id).delete();
      return NextResponse.json({ deleted: 1 }, { status: 200 });
    }

    return NextResponse.json(
      { message: "id, ids, all 중 하나의 파라미터가 필요합니다." },
      { status: 400 }
    );
  } catch (e) {
    console.error("🔥 오답노트 삭제 에러:", e);
    return NextResponse.json({ message: "삭제 실패" }, { status: 500 });
  }
}
