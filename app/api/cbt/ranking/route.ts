// 🚂 코레일 CBT — 통합 랭킹 API
//
// 코레일CBT 앱(안드로이드)과 칙칙톡톡 웹(iOS/PC/모바일)이 같은 컬렉션을 공유한다.
//   - 앱 사용자: doc id = Firebase Auth UID (예: "abc123XYZ...")
//   - 웹 사용자: doc id = 칙칙톡톡 username (예: "sungjee90")
// 인증 체계가 달라도 doc id 형식이 겹치지 않아 충돌 없이 한 보드에 같이 표시된다.
//
//   rankings/{userId}        — 유저당 1건 (통합문제 카테고리, 최고점만 갱신)
//     uid, nickname, score, category, major, timestamp
//
//   user_records/(autoId)    — 모든 풀이 기록 (개인 기록 탭용)
//     uid, nickname, score, category, major, timestamp

import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
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

function pickTimestampIso(raw: any): string | null {
  if (!raw) return null;
  if (typeof raw?.toDate === "function") return raw.toDate().toISOString();
  if (typeof raw === "string") return raw;
  if (raw?._seconds) return new Date(raw._seconds * 1000).toISOString();
  return null;
}

// ─── GET ─────────────────────────────────────────────────
// 기본: 전체 랭킹 top 100
// ?my=true: 내 기록 + 내 최고점
export async function GET(req: Request) {
  const url = new URL(req.url);
  const my = url.searchParams.get("my") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 200);

  try {
    if (my) {
      const uid = await getUserId();
      if (!uid) {
        return NextResponse.json(
          { loggedIn: false, best: null, records: [] },
          { status: 200 }
        );
      }
      const [bestDoc, recordsSnap] = await Promise.all([
        adminDb.collection("rankings").doc(uid).get(),
        adminDb.collection("user_records").where("uid", "==", uid).get(),
      ]);

      const best = bestDoc.exists
        ? {
            ...bestDoc.data(),
            timestamp: pickTimestampIso(bestDoc.data()?.timestamp),
          }
        : null;

      // 클라이언트 사이드 정렬 (복합 인덱스 회피)
      const records = recordsSnap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timestamp: pickTimestampIso(data.timestamp),
          };
        })
        .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 50);

      return NextResponse.json(
        { loggedIn: true, best, records },
        { status: 200 }
      );
    }

    // 전체 랭킹 (앱 + 웹 사용자 통합)
    const snap = await adminDb
      .collection("rankings")
      .orderBy("score", "desc")
      .limit(limit)
      .get();

    const items = snap.docs.map((d, idx) => {
      const data = d.data();
      return {
        rank: idx + 1,
        userId: d.id,
        uid: data.uid ?? d.id,
        nickname: data.nickname ?? "",
        score: data.score ?? 0,
        category: data.category ?? "",
        major: data.major ?? "",
        source: data.source ?? "app", // source 없으면 앱으로 간주 (코레일CBT 앱 호환)
        timestamp: pickTimestampIso(data.timestamp),
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error("🔥 랭킹 조회 에러:", e);
    return NextResponse.json(
      { message: "랭킹 조회 실패" },
      { status: 500 }
    );
  }
}

// ─── POST: 점수 등록 ──────────────────────────────────────
// body: { score, category, major? }
// - 항상 user_records에 1건 추가
// - rankings는 카테고리가 '통합문제'이고 기존 점수보다 높을 때만 갱신
// - 컬렉션과 필드 키는 코레일CBT 앱과 동일하게 사용 (uid, timestamp)
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
    const score = Number(body?.score);
    const category = String(body?.category ?? "").trim();
    const major = String(body?.major ?? "").trim();

    if (!Number.isFinite(score) || score < 0) {
      return NextResponse.json({ message: "잘못된 점수" }, { status: 400 });
    }

    const nickname = await getNickname(uid);

    // 1. 모든 기록 저장 (앱과 동일 컬렉션 user_records)
    //    source: 'web' 으로 표시하여 앱 등록과 구분
    await adminDb.collection("user_records").add({
      uid,
      nickname,
      score,
      category,
      major,
      source: "web",
      timestamp: FieldValue.serverTimestamp(),
    });

    // 2. 통합문제만 랭킹 갱신 (앱과 동일 컬렉션 rankings)
    let rankUpdated = false;
    if (category === "통합문제") {
      const ref = adminDb.collection("rankings").doc(uid);
      const existing = await ref.get();
      const existingScore = existing.exists
        ? (existing.data()?.score as number) || 0
        : 0;
      if (score > existingScore) {
        await ref.set({
          uid,
          nickname,
          score,
          category,
          major,
          source: "web",
          timestamp: FieldValue.serverTimestamp(),
        });
        rankUpdated = true;
      }
    }

    return NextResponse.json(
      { saved: true, rankUpdated },
      { status: 200 }
    );
  } catch (e) {
    console.error("🔥 점수 저장 에러:", e);
    return NextResponse.json(
      { message: "점수 저장 실패" },
      { status: 500 }
    );
  }
}
