"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RankingItem {
  rank: number;
  userId: string;
  uid?: string;
  nickname: string;
  score: number;
  category?: string;
  major?: string;
  source?: "web" | "app";
  timestamp?: string | null;
}

interface MyRecord {
  id: string;
  uid?: string;
  nickname: string;
  score: number;
  category?: string;
  major?: string;
  timestamp?: string | null;
}

interface MyData {
  loggedIn: boolean;
  best: {
    score: number;
    category?: string;
    major?: string;
    timestamp?: string | null;
  } | null;
  records: MyRecord[];
}

type Tab = "all" | "my";

export default function CbtRankingPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [allRanking, setAllRanking] = useState<RankingItem[] | null>(null);
  const [myData, setMyData] = useState<MyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [allRes, myRes] = await Promise.all([
          fetch("/api/cbt/ranking"),
          fetch("/api/cbt/ranking?my=true"),
        ]);
        const allJson = await allRes.json();
        const myJson = await myRes.json();
        setAllRanking(allJson.items ?? []);
        setMyData(myJson);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 백 네비 */}
      <div className="flex items-center px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/web/cbt"
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">CBT 홈</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-6 py-6 md:py-10 space-y-5">
        {/* 헤더 */}
        <header className="space-y-1">
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-amber-600 uppercase">
            Ranking
          </p>
          <h1 className="text-[24px] md:text-3xl font-extrabold text-gray-900 tracking-tight">
            랭킹
          </h1>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            무한 퀴즈 통합문제 최고 연속 정답 TOP 100
            <br />
            <span className="text-amber-600 font-bold">
              코레일CBT 앱 + 칙칙톡톡 웹 통합 랭킹.
            </span>
            <br />
            <span className="inline-block text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none align-middle">
              WEB
            </span>
            <span className="text-gray-500"> 뱃지가 칙칙톡톡 웹 등록 점수예요.</span>
          </p>
        </header>

        {/* 탭 */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-colors ${
              tab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            전체 랭킹
          </button>
          <button
            onClick={() => setTab("my")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-colors ${
              tab === "my"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            내 기록
          </button>
        </div>

        {/* 본문 */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "all" ? (
          <AllRanking items={allRanking ?? []} />
        ) : (
          <MyRanking data={myData} />
        )}

        {/* 8단계 안내 (랭킹 텅 빌 때) */}
        {!loading && tab === "all" && (allRanking?.length ?? 0) === 0 && (
          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-[13px] font-bold text-amber-800 mb-1">
              곧 등록 가능
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              무한 퀴즈가 추가되면(다음 단계) 통합문제 모드로 풀어 점수를
              등록할 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 전체 랭킹
// ──────────────────────────────────────────────────
function AllRanking({ items }: { items: RankingItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-3xl py-14 text-center">
        <div className="w-14 h-14 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
            <path d="M17 4h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4M7 4H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4" />
          </svg>
        </div>
        <p className="text-sm font-extrabold text-gray-700">아직 기록이 없어요</p>
        <p className="text-xs text-gray-500 mt-1">
          무한 퀴즈에 도전해서 첫 랭킹을 등록해 보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((it) => (
        <RankingRow key={it.userId} item={it} />
      ))}
    </div>
  );
}

function RankingRow({ item }: { item: RankingItem }) {
  const isTop3 = item.rank <= 3;
  const medalBg = !isTop3
    ? "bg-gray-100 text-gray-600"
    : item.rank === 1
    ? "bg-amber-100 text-amber-600"
    : item.rank === 2
    ? "bg-gray-200 text-gray-600"
    : "bg-orange-100 text-orange-600";
  const borderCls = !isTop3
    ? "border-gray-100"
    : item.rank === 1
    ? "border-amber-300"
    : item.rank === 2
    ? "border-gray-300"
    : "border-orange-300";

  return (
    <div
      className={`bg-white rounded-2xl p-4 border ${borderCls} flex items-center gap-3`}
    >
      <div
        className={`w-10 h-10 ${medalBg} rounded-full flex items-center justify-center shrink-0 font-extrabold text-base tabular-nums`}
      >
        {isTop3 ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
          </svg>
        ) : (
          item.rank
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[15px] font-extrabold text-gray-900 truncate">
            {item.nickname || "익명"}
          </p>
          {item.source === "web" && (
            <span className="shrink-0 text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none tracking-wider">
              WEB
            </span>
          )}
        </div>
        {(item.category || item.major) && (
          <p className="text-[11px] text-gray-500 font-semibold truncate">
            {item.category}
            {item.major ? `(${item.major})` : ""}
          </p>
        )}
      </div>
      <div className="shrink-0 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full">
        <span className="text-base font-extrabold tabular-nums">
          {item.score}
        </span>
        <span className="text-xs font-bold ml-0.5">연속</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 내 기록
// ──────────────────────────────────────────────────
function MyRanking({ data }: { data: MyData | null }) {
  if (!data) {
    return (
      <div className="text-center py-10 text-sm font-bold text-gray-500">
        데이터를 불러오지 못했어요.
      </div>
    );
  }

  if (!data.loggedIn) {
    return (
      <div className="bg-amber-50 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-base font-extrabold text-amber-900">
          로그인이 필요해요
        </p>
        <p className="text-xs text-amber-700 leading-relaxed">
          내 기록을 보려면 STAFF 로그인 후 이용할 수 있어요.
        </p>
        <Link
          href="/login"
          className="inline-block bg-amber-600 active:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  if (!data.best && data.records.length === 0) {
    return (
      <div className="bg-gray-50 rounded-3xl py-14 text-center">
        <p className="text-sm font-extrabold text-gray-700">기록이 없어요</p>
        <p className="text-xs text-gray-500 mt-1">
          무한 퀴즈를 풀고 나면 여기에 모여요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 최고 기록 카드 */}
      {data.best && (
        <div className="rounded-3xl p-7 text-center bg-gradient-to-br from-amber-500 to-red-500 text-white">
          <p className="text-[11px] font-extrabold tracking-[0.3em] opacity-80">
            BEST RECORD
          </p>
          <p className="text-6xl font-extrabold tabular-nums mt-2 leading-none">
            {data.best.score}
          </p>
          <p className="text-sm font-semibold opacity-90 mt-2">
            최고 연속 정답
            {data.best.category ? ` · ${data.best.category}` : ""}
          </p>
        </div>
      )}

      {/* 기록 리스트 */}
      {data.records.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-extrabold text-gray-900">
            전체 기록 (점수 높은 순)
          </h2>
          <div className="space-y-2">
            {data.records.map((r) => (
              <RecordRow key={r.id} record={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecordRow({ record }: { record: MyRecord }) {
  let dateStr = "";
  if (record.timestamp) {
    const d = new Date(record.timestamp);
    dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-gray-100 flex items-center gap-3">
      <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5C5.5 14.5 4 13 4 9.5 4 6 6 4 8.5 4c2 0 3 1 3.5 2 .5-1 1.5-2 3.5-2 2.5 0 4.5 2 4.5 5.5 0 3.5-1.5 5-4.5 5-1.5 0-2.5-.5-3.5-2-1 1.5-2 2-3.5 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-extrabold text-gray-900">
          {record.score}문제 연속 정답
        </p>
        <p className="text-[11px] text-gray-500 font-semibold">
          {record.category}
          {record.major ? `(${record.major})` : ""}
          {dateStr ? `  ·  ${dateStr}` : ""}
        </p>
      </div>
    </div>
  );
}
