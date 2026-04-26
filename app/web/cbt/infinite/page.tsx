"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadCbtData } from "@/lib/cbt/data";
import type { Question } from "@/lib/cbt/types";

type Step = 0 | 1 | 2;

const MAJORS = [
  "사무영업",
  "운전",
  "차량",
  "토목",
  "건축",
  "전기통신",
  "신호제어",
] as const;

// 사무영업 카테고리 → 사규(source) 목록
const CATEGORY_SOURCES: Record<string, string[]> = {
  공통사항: [
    "전체",
    "철도안전보건 관리 규정",
    "산업안전보건 관리 세칙",
    "재해업무 처리 규정",
    "비상대응 시행세칙",
    "철도안전관리 시행세칙",
    "철도안전점검 및 심사평가시행세칙",
    "소방안전관리 시행세칙",
    "철도사고조사 및 피해구상 세칙",
  ],
  "여객·화물관계사규": [
    "전체",
    "여객운송약관",
    "광역철도 여객운송약관",
    "철도화물운송약관",
    "화물운송세칙",
    "화물수송 내규",
    "영업사고처리세칙",
  ],
  운전관계사규: [
    "전체",
    "운전취급규정",
    "운전취급 내규 일부개정안 전문",
    "운전보안장치취급 내규 개정 전문",
    "운전장표취급 내규 개정 전문",
    "열차운행선로 지장작업 업무세칙",
  ],
};

export default function CbtInfinitePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [major, setMajor] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { aiQuestions } = await loadCbtData();
        setAiQuestions(aiQuestions);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ─── 카테고리별 문제 수 (헤드업)
  const counts = useMemo(() => {
    const byCategory = { 공통사항: 0, "여객·화물관계사규": 0, 운전관계사규: 0 };
    const bySource: Record<string, number> = {};
    for (const q of aiQuestions) {
      if (q.category && byCategory[q.category as keyof typeof byCategory] !== undefined) {
        byCategory[q.category as keyof typeof byCategory]++;
      }
      if (q.source) bySource[q.source] = (bySource[q.source] || 0) + 1;
    }
    return { byCategory, bySource, total: aiQuestions.length };
  }, [aiQuestions]);

  // 직렬별 표시할 카테고리
  const availableCategoriesForMajor = useMemo(() => {
    if (major === "사무영업") {
      return ["공통사항", "여객·화물관계사규", "운전관계사규"];
    }
    if (major === "운전") {
      return ["공통사항", "운전관계사규"];
    }
    // 그 외: 공통사항만
    return ["공통사항"];
  }, [major]);

  // 운전 직렬은 운전관계사규 → 운전취급규정만
  const availableSources = useMemo(() => {
    if (!category) return [];
    if (major === "운전" && category === "운전관계사규") {
      return ["운전취급규정"];
    }
    return CATEGORY_SOURCES[category] ?? ["전체"];
  }, [major, category]);

  // 시작 (통합문제 또는 일반)
  function start(opts: { category: string; source: string }) {
    const params = new URLSearchParams({
      mode: "infinite",
      category: opts.category,
      source: opts.source,
      major,
    });
    router.push(`/web/cbt/quiz?${params.toString()}` as any);
  }

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 상단 백 네비 + 진행 */}
      <div className="flex items-center justify-between px-5 h-12 md:h-14 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <button
          onClick={() => {
            if (step > 0) setStep((s) => (s - 1) as Step);
            else router.push("/web/cbt");
          }}
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">뒤로</span>
        </button>
        <span className="text-xs font-extrabold text-amber-600 tracking-widest">
          {step + 1} / 3
        </span>
        <span className="w-12" />
      </div>
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-md mx-auto px-5 md:px-6 py-7 md:py-12 space-y-6">
        {/* 헤더 */}
        {step === 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-amber-600 uppercase">
              Infinite Quiz
            </p>
            <h1 className="text-[24px] md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              무한 퀴즈
            </h1>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              한 문제 틀리면 즉시 게임오버. 연속 정답 기록에 도전!
              <br />
              <span className="text-amber-600 font-bold">
                {isLoading ? "로딩 중..." : `AI 사규문제 총 ${counts.total}문항`}
              </span>
            </p>
          </div>
        )}

        {/* Step 0: 직렬 선택 */}
        {step === 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-gray-900 mb-2">
              응시 직렬을 선택해 주세요
            </h2>
            {MAJORS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMajor(m);
                  setCategory("");
                  setStep(1);
                }}
                className="w-full flex items-center gap-3 bg-gray-50 active:bg-gray-100 p-4 rounded-2xl transition-colors"
              >
                <div className="w-10 h-10 shrink-0 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-extrabold text-sm">
                  {m.charAt(0)}
                </div>
                <span className="flex-1 text-left text-[15px] font-bold text-gray-900">
                  {m}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: 카테고리 선택 */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {major}
              </h2>
              <p className="text-sm text-gray-500 font-semibold mt-0.5">
                과목·카테고리를 선택하세요
              </p>
            </div>

            {/* 사무영업 전용: 통합문제 카드 (랭킹 등록 가능) */}
            {major === "사무영업" && (
              <button
                onClick={() =>
                  start({ category: "통합문제", source: "통합" })
                }
                className="w-full text-left p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-red-500 text-white active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-extrabold tracking-tight">
                      통합문제
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">
                      모든 사규 {counts.total}문제 랜덤 셔플
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold bg-white/25 px-2 py-0.5 rounded">
                      🏆 랭킹 등록 가능
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* 카테고리 카드 */}
            {availableCategoriesForMajor.map((cat) => {
              const count =
                counts.byCategory[cat as keyof typeof counts.byCategory] ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setStep(2);
                  }}
                  className="w-full flex items-center gap-3 bg-gray-50 active:bg-gray-100 p-4 rounded-2xl transition-colors"
                >
                  <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] font-extrabold text-gray-900">
                      {cat === "공통사항" && major !== "사무영업"
                        ? "철도안전관리 (공통사항)"
                        : cat}
                    </p>
                    <p className="text-[11px] text-gray-500 font-semibold">
                      {major === "운전" && cat === "운전관계사규"
                        ? `운전취급규정 ${counts.bySource["운전취급규정"] ?? 0}문제`
                        : `${count}문제`}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              );
            })}

            {major !== "사무영업" && (
              <div className="bg-amber-50 rounded-2xl p-3 text-[11px] text-amber-700 font-semibold leading-relaxed">
                활성화된 과목 외에는 아직 문제가 준비 중이에요.
                <br />
                통합문제 랭킹 등록은 <strong>사무영업</strong> 직렬에서만
                가능해요.
              </div>
            )}
          </div>
        )}

        {/* Step 2: 사규 선택 */}
        {step === 2 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {category}
              </h2>
              <p className="text-sm text-gray-500 font-semibold mt-0.5">
                연습할 사규를 선택하세요
              </p>
            </div>

            <div className="space-y-2">
              {availableSources.map((src) => {
                const count =
                  src === "전체"
                    ? counts.byCategory[
                        category as keyof typeof counts.byCategory
                      ] ?? 0
                    : counts.bySource[src] ?? 0;
                const disabled = count === 0;
                return (
                  <button
                    key={src}
                    onClick={() => !disabled && start({ category, source: src })}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-colors text-left ${
                      disabled
                        ? "bg-gray-50 opacity-50 cursor-not-allowed"
                        : src === "전체"
                        ? "bg-amber-50 active:bg-amber-100"
                        : "bg-white border border-gray-100 active:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                        src === "전체"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {src === "전체" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 3 21 3 21 8" />
                          <line x1="4" y1="20" x2="21" y2="3" />
                          <polyline points="21 16 21 21 16 21" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1 text-[14px] font-bold text-gray-900">
                      {src}
                    </span>
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                        disabled
                          ? "bg-red-50 text-red-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {disabled ? "미구현" : `${count}문제`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
