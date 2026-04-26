// 🚂 코레일 CBT — 랭킹 API
//
// 칙칙톡톡 웹 전용 랭킹. 코레일CBT 앱(Firebase Auth UID 기반)과는
// 인증 체계가 달라 분리된 컬렉션 사용.
//
//   cbtRankings/{userId}        — 유저당 1건 (최고점 갱신만)
//     userId, nickname, score, category, major, updatedAt
//
//   cbtRankRecords/(autoId)     — 모든 풀이 기록 (개인 기록 탭용)
//     userId, nickname, score, category, major, createdAt

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

// ─── GET ─────────────────────────────────────────────────
// 기본: 전체 랭킹 top 100
// ?my=true: 내 기록 (cbtRankRecords) + 내 최고점 (cbtRankings)
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
        adminDb.collection("cbtRankings").doc(uid).get(),
        adminDb
          .collection("cbtRankRecords")
          .where("userId", "==", uid)
          .get(),
      ]);

      const best = bestDoc.exists
        ? {
            ...bestDoc.data(),
            updatedAt:
              bestDoc.data()?.updatedAt?.toDate?.()?.toISOString() ?? null,
          }
        : null;

      // 클라이언트에서 정렬 (복합 인덱스 회피)
      const records = recordsSnap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString() ?? null,
          };
        })
        .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 50);

      return NextResponse.json(
        { loggedIn: true, best, records },
        { status: 200 }
      );
    }

    // 전체 랭킹
    const snap = await adminDb
      .collection("cbtRankings")
      .orderBy("score", "desc")
      .limit(limit)
      .get();

    const items = snap.docs.map((d, idx) => {
      const data = d.data();
      return {
        rank: idx + 1,
        userId: d.id,
        nickname: data.nickname ?? "",
        score: data.score ?? 0,
        category: data.category ?? "",
        major: data.major ?? "",
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
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
// - 항상 cbtRankRecords에 1건 추가
// - cbtRankings는 카테고리가 '통합문제'이고 기존 점수보다 높을 때만 갱신
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

    // 1. 모든 기록 저장
    await adminDb.collection("cbtRankRecords").add({
      userId: uid,
      nickname,
      score,
      category,
      major,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 2. 통합문제만 랭킹 갱신
    let rankUpdated = false;
    if (category === "통합문제") {
      const ref = adminDb.collection("cbtRankings").doc(uid);
      const existing = await ref.get();
      const existingScore = existing.exists
        ? (existing.data()?.score as number) || 0
        : 0;
      if (score > existingScore) {
        await ref.set({
          userId: uid,
          nickname,
          score,
          category,
          major,
          updatedAt: FieldValue.serverTimestamp(),
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
