"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WrongItem {
  id: string;
  year: string;
  round: string;
  major: string;
  type: string;
  subject: string;
  no: number;
  question: string;
  options: string[];
  answer: number;
  image?: string | null;
  source?: string | null;
  category?: string | null;
  explanation?: string | null;
  isAI?: boolean;
  userAnswer?: number;
  savedAt?: string | null;
}

export default function CbtWrongPage() {
  const router = useRouter();
  const [items, setItems] = useState<WrongItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, []);

  async function refetch() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cbt/wrong-answers");
      const data = await res.json();
      setItems(data.items ?? []);
      setIsLoggedIn(!!data.loggedIn);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm("이 오답을 노트에서 지울까요?")) return;
    try {
      setDeleting(id);
      const res = await fetch(
        `/api/cbt/wrong-answers?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (res.ok) setItems((prev) => prev.filter((x) => x.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function clearAll() {
    if (!confirm(`오답 ${items.length}개를 전부 지울까요? 되돌릴 수 없어요.`))
      return;
    try {
      const res = await fetch("/api/cbt/wrong-answers?all=true", {
        method: "DELETE",
      });
      if (res.ok) setItems([]);
    } catch {}
  }

  function startRetry() {
    if (items.length === 0) return;
    router.push("/web/cbt/quiz?mode=wrong" as any);
  }

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
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-red-500 uppercase">
            Wrong Note
          </p>
          <h1 className="text-[24px] md:text-3xl font-extrabold text-gray-900 tracking-tight">
            오답 노트
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            틀린 문제만 모아 다시 풀고, 맞히면 자동으로 사라져요.
          </p>
        </header>

        {/* 로딩 */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !isLoggedIn ? (
          // 비로그인
          <div className="bg-amber-50 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <p className="text-base font-extrabold text-amber-900">
                로그인이 필요해요
              </p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                오답노트는 STAFF 로그인 후<br />이용할 수 있어요.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block bg-amber-600 active:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
            >
              로그인하러 가기
            </Link>
          </div>
        ) : items.length === 0 ? (
          // 빈 상태
          <div className="bg-gray-50 rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto bg-white rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-extrabold text-gray-900">
              저장된 오답이 없어요
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              기출 모의고사를 풀고 틀리면<br />여기에 자동으로 모여요.
            </p>
            <Link
              href="/web/cbt/select"
              className="inline-block bg-blue-600 active:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm mt-2"
            >
              기출 풀러 가기
            </Link>
          </div>
        ) : (
          <>
            {/* 액션 영역 */}
            <div className="bg-purple-700 text-white p-5 md:p-6 rounded-3xl">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold tracking-wider opacity-80">
                    저장된 오답
                  </p>
                  <p className="text-3xl md:text-4xl font-extrabold tabular-nums">
                    {items.length}
                    <span className="text-base font-bold opacity-70"> 문제</span>
                  </p>
                </div>
                <button
                  onClick={startRetry}
                  className="shrink-0 bg-white text-purple-700 font-extrabold px-5 py-3 rounded-2xl active:scale-95 transition-transform text-sm"
                >
                  전체 다시 풀기
                </button>
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900">
                  최근 저장 순
                </h2>
                <button
                  onClick={clearAll}
                  className="text-[11px] font-extrabold text-red-500 active:text-red-700"
                >
                  전체 삭제
                </button>
              </div>

              <div className="space-y-2">
                {items.map((it) => (
                  <WrongRow
                    key={it.id}
                    item={it}
                    onDelete={() => deleteOne(it.id)}
                    deleting={deleting === it.id}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WrongRow({
  item,
  onDelete,
  deleting,
}: {
  item: WrongItem;
  onDelete: () => void;
  deleting: boolean;
}) {
  const tag = item.isAI
    ? `AI · ${item.source ?? ""}`
    : `${item.year}·${item.round}·${item.type}형·${item.no}번`;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                item.isAI
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {tag}
            </span>
            {!item.isAI && item.subject && (
              <span className="text-[10px] font-bold text-gray-400">
                {item.subject}
              </span>
            )}
          </div>
          <p className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">
            {item.question}
          </p>
          {item.savedAt && (
            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
              {new Date(item.savedAt).toLocaleString("ko-KR")}
            </p>
          )}
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="shrink-0 -mr-1 -mt-1 p-2 text-gray-400 active:text-red-500 disabled:opacity-30"
          aria-label="삭제"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
