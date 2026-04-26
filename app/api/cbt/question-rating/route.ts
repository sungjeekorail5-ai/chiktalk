// 🚂 코레일 CBT — AI 문제 평가 저장 API
//
// 코레일CBT 앱(question_ratings 컬렉션)과 같은 컬렉션을 공유한다.
// questionId 형식은 앱과 동일하게 `${source}_${no}` 사용.
//
//   question_ratings/(autoId)
//     questionId : string  (예: "운전취급규정_42")
//     rating     : "good" | "bad" | "wrong"
//     uid        : string  (또는 "anonymous")
//     nickname   : string
//     source     : "web"
//     timestamp  : serverTimestamp

import { NextResponse } from "next/server";
import { adminDb, cbtAdminDb, FieldValue } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session || session === "guest_session") return null;
  return session;
}

async function getNickname(userId: string): Promise<string> {
  try {
    const doc = await adminDb.collection("users").doc(userId).get();
    if (doc.exists) return (doc.data()?.nickname as string) || userId;
  } catch {}
  return userId;
}

const VALID_RATINGS = new Set(["good", "bad", "wrong"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questionId = String(body?.questionId ?? "").trim();
    const rating = String(body?.rating ?? "").trim();

    if (!questionId) {
      return NextResponse.json({ message: "questionId 누락" }, { status: 400 });
    }
    if (!VALID_RATINGS.has(rating)) {
      return NextResponse.json({ message: "잘못된 rating" }, { status: 400 });
    }

    const uid = await getUserId();
    const nickname = uid ? await getNickname(uid) : "비회원";

    await cbtAdminDb.collection("question_ratings").add({
      questionId,
      rating,
      uid: uid ?? "anonymous",
      nickname,
      source: "web",
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (e) {
    console.error("🔥 AI 문제 평가 저장 에러:", e);
    return NextResponse.json({ message: "저장 실패" }, { status: 500 });
  }
}
