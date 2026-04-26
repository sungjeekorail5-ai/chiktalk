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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "guest" | "error">("idle");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (raw) setResult(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  // 오답 자동 저장 (기출 모드만 — 다시풀기 모드는 이미 풀 때 삭제 처리됨)
  useEffect(() => {
    if (!result) return;
    if (result.mode !== "exam") return;
    if (result.wrongList.length === 0) return;

    const items = result.wrongList.map(({ question: q, selectedIndex }) => ({
      id: q.id,
      year: q.year,
      round: q.round,
      major: q.major,
      type: q.type,
      subject: q.subject,
      no: q.no,
      question: q.question,
      options: q.options,
      answer: q.answer,
      image: q.image ?? null,
      source: q.source ?? null,
      category: q.category ?? null,
      explanation: q.explanation ?? null,
      isAI: q.isAI,
      userAnswer: selectedIndex + 1, // 1-based
    }));

    setSaveStatus("saving");
    fetch("/api/cbt/wrong-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => {
        if (res.status === 401) setSaveStatus("guest");
        else if (res.ok) setSaveStatus("saved");
        else setSaveStatus("error");
      })
      .catch(() => setSaveStatus("error"));
  }, [result]);

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

        {/* ──────────── 오답노트 저장 상태 안내 ──────────── */}
        {wrongCount > 0 && result.mode === "exam" && (
          <SaveStatusBanner status={saveStatus} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 오답 저장 상태 배너
// ──────────────────────────────────────────────────
function SaveStatusBanner({
  status,
}: {
  status: "idle" | "saving" | "saved" | "guest" | "error";
}) {
  if (status === "idle" || status === "saving") {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 text-xs font-bold text-gray-500 text-center">
        오답노트에 저장 중...
      </div>
    );
  }
  if (status === "saved") {
    return (
      <Link
        href="/web/cbt/wrong"
        className="block bg-green-50 rounded-2xl p-4 active:bg-green-100 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-extrabold text-green-800">
              오답이 자동 저장되었어요
            </p>
            <p className="text-xs text-green-600">
              오답노트에서 다시 풀어볼 수 있어요 →
            </p>
          </div>
        </div>
      </Link>
    );
  }
  if (status === "guest") {
    return (
      <div className="bg-amber-50 rounded-2xl p-4">
        <p className="text-[13px] font-bold text-amber-800 mb-1">
          로그인하면 자동 저장돼요
        </p>
        <p className="text-xs text-amber-700 leading-relaxed mb-3">
          STAFF 로그인 시 틀린 문제가 자동으로 오답노트에 저장됩니다.
        </p>
        <Link
          href="/login"
          className="inline-block bg-amber-600 active:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }
  return (
    <div className="bg-red-50 rounded-2xl p-4 text-xs font-bold text-red-700 text-center">
      오답노트 저장에 실패했어요. 잠시 후 다시 시도해주세요.
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
