"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loadCbtData,
  pickExamQuestions,
  isCorrect,
} from "@/lib/cbt/data";
import type { ExamSelection, Question, QuizResult } from "@/lib/cbt/types";

const RESULT_STORAGE_KEY = "cbt:lastResult";

export default function QuizClient() {
  const router = useRouter();
  const params = useSearchParams();

  const mode = params.get("mode") || "exam";
  const yearsParam = params.get("years") || "";
  const major = params.get("major") || "";
  const subject = params.get("subject") || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]); // -1 = 미응답
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showOmr, setShowOmr] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // 데이터 로드 + 출제
  useEffect(() => {
    (async () => {
      try {
        if (mode === "exam") {
          const { questions: all } = await loadCbtData();
          const selection: ExamSelection = {
            years: yearsParam.split(",").filter(Boolean),
            major,
            subject,
          };
          const picked = pickExamQuestions(all, selection);
          if (picked.length === 0) {
            alert("선택한 조건의 기출문제가 없습니다.");
            router.replace("/web/cbt/select");
            return;
          }
          setQuestions(picked);
          setUserAnswers(new Array(picked.length).fill(-1));
          setIsLoading(false);
          return;
        }

        if (mode === "wrong") {
          // 오답노트 다시 풀기 — Firestore에 저장된 오답을 그대로 출제
          const res = await fetch("/api/cbt/wrong-answers");
          if (!res.ok) throw new Error("오답노트를 불러오지 못했습니다.");
          const { items, loggedIn } = await res.json();
          if (!loggedIn) {
            alert("오답노트는 로그인 후 이용할 수 있어요.");
            router.replace("/login");
            return;
          }
          if (!items || items.length === 0) {
            alert("저장된 오답이 없어요.");
            router.replace("/web/cbt/wrong");
            return;
          }
          // 저장된 데이터 그대로 사용 (image → imageUrl 변환만)
          const picked: Question[] = items.map((it: any) => ({
            year: it.year ?? "",
            round: it.round ?? "",
            major: it.major ?? "",
            type: it.type ?? "",
            subject: it.subject ?? "",
            no: it.no ?? 0,
            question: it.question ?? "",
            options: Array.isArray(it.options) ? it.options : [],
            answer: it.answer ?? 0,
            image: it.image ?? undefined,
            source: it.source ?? undefined,
            category: it.category ?? undefined,
            explanation: it.explanation ?? undefined,
            id: it.id,
            isAI: !!it.isAI,
            imageUrl: it.image
              ? it.image.startsWith("assets/images/")
                ? "/cbt/" + it.image.substring("assets/".length)
                : it.image
              : undefined,
          }));
          setQuestions(picked);
          setUserAnswers(new Array(picked.length).fill(-1));
          setIsLoading(false);
          return;
        }

        // 그 외 모드 = placeholder
        setIsLoading(false);
      } catch (e) {
        console.error(e);
        alert("문제 데이터를 불러오지 못했습니다.");
        router.replace("/web/cbt");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 타이머
  useEffect(() => {
    if (!isTimerRunning || isLoading) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, isLoading]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [seconds]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-500">문제 준비 중...</p>
        </div>
      </div>
    );
  }

  if (mode !== "exam" && mode !== "wrong") {
    return (
      <div className="max-w-md mx-auto px-5 py-12 text-center space-y-4">
        <div className="text-4xl">🚧</div>
        <p className="text-lg font-extrabold text-gray-900">
          이 모드는 다음 단계에서 구현 예정이에요
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

  const currentQ = questions[currentIndex];
  const currentSelected = userAnswers[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const solvedCount = userAnswers.filter((a) => a !== -1).length;

  const selectOption = (idx: number) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const submit = async () => {
    let correct = 0;
    const wrongList: QuizResult["wrongList"] = [];
    for (let i = 0; i < questions.length; i++) {
      if (isCorrect(userAnswers[i], questions[i].answer)) {
        correct++;
      } else if (userAnswers[i] !== -1) {
        wrongList.push({ question: questions[i], selectedIndex: userAnswers[i] });
      }
    }

    const result: QuizResult = {
      mode: mode as any,
      total: questions.length,
      correct,
      score: correct,
      durationSeconds: seconds,
      questions,
      userAnswers,
      wrongList,
    };

    try {
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
    } catch {}

    // 오답노트 다시풀기 모드: 맞춘 문제는 자동으로 오답에서 삭제
    if (mode === "wrong") {
      const correctIds = questions
        .filter((q, i) => isCorrect(userAnswers[i], q.answer))
        .map((q) => q.id);
      if (correctIds.length > 0) {
        try {
          await fetch(
            `/api/cbt/wrong-answers?ids=${encodeURIComponent(correctIds.join(","))}`,
            { method: "DELETE" }
          );
        } catch {}
      }
    }

    router.push("/web/cbt/result" as any);
  };

  const handleExit = () => {
    setShowExitDialog(false);
    router.push("/web/cbt");
  };

  // ─── 출처 태그 ───
  const sourceTag = currentQ.isAI ? (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md">
        AI 생성문제
      </span>
      {currentQ.source && (
        <span className="text-[11px] font-extrabold bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-md">
          출처: {currentQ.source}
        </span>
      )}
    </div>
  ) : (
    <span className="inline-block text-[12px] font-extrabold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md">
      {currentQ.year}년 {currentQ.round} {currentQ.type}형 {currentQ.no}번 · {currentQ.subject}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ──────────── 상단 AppBar ──────────── */}
      <header className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between h-12 md:h-14 px-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="p-2 disabled:opacity-30 active:bg-white/10 rounded-lg"
            aria-label="이전 문제"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={() => setShowOmr(true)}
            className="flex items-center gap-1.5 bg-white/15 active:bg-white/25 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <span className="text-sm font-bold">
              {currentIndex + 1} / {questions.length}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>

          <div className="flex items-center">
            <button
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
              className="p-2 disabled:opacity-30 active:bg-white/10 rounded-lg"
              aria-label="다음 문제"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button
              onClick={() => setShowExitDialog(true)}
              className="p-2 active:bg-white/10 rounded-lg"
              aria-label="시험 종료"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {/* 진행률 바 */}
        <div className="h-1 bg-blue-900/30">
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* ──────────── 타이머 ──────────── */}
      <div className="bg-white px-5 md:px-6 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2 text-blue-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-base md:text-lg font-extrabold tabular-nums">
            {formattedTime}
          </span>
        </div>
        <button
          onClick={() => setIsTimerRunning((v) => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors ${
            isTimerRunning
              ? "border-red-300 bg-red-50 text-red-600 active:bg-red-100"
              : "border-green-300 bg-green-50 text-green-600 active:bg-green-100"
          }`}
        >
          {isTimerRunning ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              일시정지
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              재생하기
            </>
          )}
        </button>
      </div>

      {/* ──────────── 본문 (일시정지 시 가려짐) ──────────── */}
      <div className="flex-1 overflow-y-auto pb-32">
        {!isTimerRunning ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            </div>
            <p className="text-lg font-extrabold text-gray-900">
              시험이 일시정지 되었습니다
            </p>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              [재생하기] 버튼을 누르면
              <br />
              문제가 다시 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-5 md:px-6 py-6 space-y-5">
            {sourceTag}

            <h2 className="text-[18px] md:text-xl font-bold text-gray-900 leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h2>

            {currentQ.imageUrl && (
              <div className="rounded-2xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQ.imageUrl}
                  alt="문제 이미지"
                  className="w-full h-auto max-h-[40vh] object-contain"
                />
              </div>
            )}

            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentSelected === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-4 rounded-2xl transition-all ${
                      isSelected
                        ? "bg-blue-50 border-2 border-blue-600"
                        : "bg-white border-2 border-gray-200 active:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`flex-1 text-[15px] leading-relaxed ${
                        isSelected
                          ? "text-blue-900 font-bold"
                          : "text-gray-800 font-medium"
                      }`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ──────────── 하단 버튼 ──────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 md:px-6 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={isLast ? submit : goNext}
            className={`w-full py-4 rounded-2xl font-extrabold text-white transition-all active:scale-[0.98] ${
              isLast
                ? "bg-blue-700 active:bg-blue-800"
                : "bg-gray-900 active:bg-blue-700"
            }`}
          >
            {isLast ? "채점 및 결과 보기" : "다음 문제"}
          </button>
        </div>
      </div>

      {/* ──────────── OMR 답안지 모달 ──────────── */}
      {showOmr && (
        <OmrSheet
          total={questions.length}
          solved={solvedCount}
          userAnswers={userAnswers}
          currentIndex={currentIndex}
          onJump={(i) => {
            setCurrentIndex(i);
            setShowOmr(false);
          }}
          onClose={() => setShowOmr(false)}
        />
      )}

      {/* ──────────── 종료 확인 ──────────── */}
      {showExitDialog && (
        <ExitDialog
          onCancel={() => setShowExitDialog(false)}
          onConfirm={handleExit}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────
// OMR 답안지 (Bottom Sheet)
// ──────────────────────────────────────────────────
function OmrSheet({
  total,
  solved,
  userAnswers,
  currentIndex,
  onJump,
  onClose,
}: {
  total: number;
  solved: number;
  userAnswers: number[];
  currentIndex: number;
  onJump: (i: number) => void;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl mx-auto bg-white rounded-t-3xl pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-slide-up"
        style={{
          animation: "cbt-slide-up 0.25s ease-out",
        }}
      >
        <style>{`
          @keyframes cbt-slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="px-6 pt-2 pb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
            OMR 답안지
          </h3>
          <div className="text-xs font-bold flex items-center gap-3">
            <span className="text-blue-700">푼 문제 {solved}</span>
            <span className="text-red-500">안 푼 {total - solved}</span>
          </div>
        </div>
        <div className="px-6 pb-2 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: total }).map((_, i) => {
              const isSolved = userAnswers[i] !== -1;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  className={`aspect-square rounded-xl text-base font-extrabold transition-all ${
                    isSolved
                      ? "bg-blue-700 text-white"
                      : "bg-white text-gray-700 border border-gray-300"
                  } ${
                    isCurrent ? "ring-4 ring-amber-400" : ""
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-6 pt-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gray-100 active:bg-gray-200 text-gray-700 font-bold rounded-2xl"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 종료 확인 다이얼로그
// ──────────────────────────────────────────────────
function ExitDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">시험 종료</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          정말 시험을 중단하고 나가시겠습니까?
          <br />
          지금까지 푼 기록은 모두 초기화됩니다.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 active:bg-gray-200 text-gray-700 font-bold rounded-xl"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 active:bg-red-600 text-white font-extrabold rounded-xl"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
