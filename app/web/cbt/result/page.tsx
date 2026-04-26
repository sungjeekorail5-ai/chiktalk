"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Question, QuizResult } from "@/lib/cbt/types";
import { isCorrect } from "@/lib/cbt/data";

const RESULT_STORAGE_KEY = "cbt:lastResult";

type FilterMode = "wrong" | "all";

export default function CbtResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("wrong");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (raw) setResult(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  // 분류된 문제 목록
  const reviewItems = useMemo(() => {
    if (!result) return [];
    const items: Array<{
      question: Question;
      userIndex: number;
      status: "correct" | "wrong" | "unanswered";
      no: number;
    }> = [];
    for (let i = 0; i < result.questions.length; i++) {
      const q = result.questions[i];
      const u = result.userAnswers[i];
      let status: "correct" | "wrong" | "unanswered";
      if (u === -1) status = "unanswered";
      else if (isCorrect(u, q.answer)) status = "correct";
      else status = "wrong";
      items.push({ question: q, userIndex: u, status, no: i + 1 });
    }
    return items;
  }, [result]);

  const wrongOrUnanswered = useMemo(
    () => reviewItems.filter((r) => r.status !== "correct"),
    [reviewItems]
  );
  const visibleItems = filter === "wrong" ? wrongOrUnanswered : reviewItems;

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-5 py-12 text-center space-y-4">
        <p className="text-base font-bold text-gray-700">
          결과 데이터가 없어요.
        </p>
        <button
          onClick={() => router.push("/web/cbt")}
          className="bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          CBT 홈으로
        </button>
      </div>
    );
  }

  const percent = Math.round((result.correct / result.total) * 100);
  const m = Math.floor(result.durationSeconds / 60);
  const s = result.durationSeconds % 60;
  const timeStr = `${m}:${s.toString().padStart(2, "0")}`;
  const unansweredCount = reviewItems.filter(
    (r) => r.status === "unanswered"
  ).length;
  const wrongCount = result.wrongList.length;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-5 md:px-6 py-6 md:py-10 space-y-6">
        {/* ──────────── 점수 카드 ──────────── */}
        <div className="bg-blue-700 text-white p-7 md:p-8 rounded-3xl text-center space-y-2">
          <p className="text-[11px] font-extrabold tracking-[0.3em] opacity-80">
            결과
          </p>
          <p className="text-6xl md:text-7xl font-extrabold tabular-nums leading-none">
            {result.correct}
            <span className="text-3xl md:text-4xl opacity-60 font-bold">
              {" "}/ {result.total}
            </span>
          </p>
          <p className="text-sm font-semibold opacity-90 mt-2">
            정답률 {percent}% · 소요 시간 {timeStr}
          </p>
        </div>

        {/* ──────────── 통계 3종 ──────────── */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Stat
            label="맞은 문제"
            value={result.correct}
            color="text-green-600"
          />
          <Stat label="틀린 문제" value={wrongCount} color="text-red-500" />
          <Stat
            label="미응답"
            value={unansweredCount}
            color="text-gray-500"
          />
        </div>

        {/* ──────────── 오답 리뷰 헤더 + 필터 ──────────── */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-gray-900">
                {filter === "wrong" ? "오답 · 미응답 리뷰" : "전체 문제 리뷰"}
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                정답 = 초록, 선택한 오답 = 빨강
              </p>
            </div>
            <div className="flex gap-1 p-1 bg-gray-200 rounded-xl">
              <button
                onClick={() => setFilter("wrong")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                  filter === "wrong"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                오답만
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                  filter === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                전체
              </button>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-extrabold text-green-700">
                전부 맞췄어요!
              </p>
              <p className="text-xs text-green-600 mt-1">
                완벽한 결과입니다 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((item) => (
                <ReviewCard key={item.question.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* ──────────── 액션 ──────────── */}
        <div className="space-y-2 pt-4">
          <Link
            href="/web/cbt/select"
            className="block w-full text-center bg-gray-900 active:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition-colors"
          >
            다른 시험 풀러 가기
          </Link>
          <Link
            href="/web/cbt"
            className="block w-full text-center bg-white active:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
          >
            CBT 홈
          </Link>
        </div>

        {/* ──────────── 6단계 안내 ──────────── */}
        {wrongCount > 0 && (
          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-[13px] font-bold text-amber-800 mb-1">
              곧 추가될 기능
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              로그인하면 틀린 문제가 자동으로 오답노트에 저장되고, 나중에 다시 풀어볼 수 있게 됩니다.
              (다음 단계에서 구현 예정)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 통계 카드
// ──────────────────────────────────────────────────
function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 md:p-4 text-center border border-gray-100">
      <p className="text-[10px] md:text-[11px] font-bold text-gray-500">
        {label}
      </p>
      <p className={`text-xl md:text-2xl font-extrabold tabular-nums mt-0.5 ${color}`}>
        {value}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 리뷰 카드 (문제 + 답 + 정답 + 풀이)
// ──────────────────────────────────────────────────
function ReviewCard({
  item,
}: {
  item: {
    question: Question;
    userIndex: number;
    status: "correct" | "wrong" | "unanswered";
    no: number;
  };
}) {
  const { question: q, userIndex, status, no } = item;

  const statusLabel =
    status === "correct" ? "정답" : status === "wrong" ? "오답" : "미응답";
  const statusBg =
    status === "correct"
      ? "bg-green-50 text-green-700"
      : status === "wrong"
      ? "bg-red-50 text-red-600"
      : "bg-gray-100 text-gray-500";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-extrabold text-gray-400 tabular-nums">
          {no}번
        </span>
        <span
          className={`text-[10px] font-extrabold ${statusBg} px-2 py-0.5 rounded-md`}
        >
          {statusLabel}
        </span>
        {q.isAI ? (
          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
            AI 생성
          </span>
        ) : (
          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
            {q.year}·{q.round}·{q.type}형·{q.no}번
          </span>
        )}
      </div>

      {/* 문제 */}
      <p className="text-[15px] font-bold text-gray-900 leading-relaxed">
        {q.question}
      </p>

      {/* 이미지 */}
      {q.imageUrl && (
        <div className="rounded-xl overflow-hidden bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={q.imageUrl}
            alt="문제 이미지"
            className="w-full h-auto max-h-[30vh] object-contain"
          />
        </div>
      )}

      {/* 보기 */}
      <div className="space-y-1.5">
        {q.options.map((opt, idx) => {
          const isUserPick = userIndex === idx;
          const isAnswer = idx + 1 === q.answer;
          let cls =
            "border-gray-200 bg-white text-gray-700"; // default
          let icon: React.ReactNode = null;

          if (isAnswer) {
            cls = "border-green-500 bg-green-50 text-green-800";
            icon = (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            );
          }
          if (isUserPick && !isAnswer) {
            cls = "border-red-400 bg-red-50 text-red-700";
            icon = (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            );
          }

          return (
            <div
              key={idx}
              className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[13px] ${cls}`}
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-[11px] font-extrabold">
                {idx + 1}
              </span>
              <span className="flex-1 leading-snug font-medium">{opt}</span>
              {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
            </div>
          );
        })}
      </div>

      {/* 사용자 응답 라벨 (미응답인 경우) */}
      {status === "unanswered" && (
        <p className="text-[11px] font-bold text-gray-500">
          답을 선택하지 않았어요
        </p>
      )}

      {/* AI 풀이 */}
      {q.isAI && q.explanation && (
        <div className="bg-indigo-50 rounded-xl p-3.5 border border-indigo-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span className="text-[11px] font-extrabold text-indigo-700">
              정답 풀이
            </span>
          </div>
          <p className="text-[13px] text-indigo-900 leading-relaxed font-medium whitespace-pre-wrap">
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
