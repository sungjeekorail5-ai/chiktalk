"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuizResult } from "@/lib/cbt/types";

const RESULT_STORAGE_KEY = "cbt:lastResult";

export default function CbtResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (raw) setResult(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

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

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      <div className="max-w-md mx-auto px-5 md:px-6 py-8 md:py-12 space-y-6">
        {/* 점수 카드 */}
        <div className="bg-blue-700 text-white p-8 rounded-3xl text-center space-y-2">
          <p className="text-[11px] font-extrabold tracking-[0.3em] opacity-80">
            결과
          </p>
          <p className="text-6xl font-extrabold tabular-nums">
            {result.correct}
            <span className="text-3xl opacity-60 font-bold">
              {" "}/ {result.total}
            </span>
          </p>
          <p className="text-sm font-semibold opacity-80">
            정답률 {percent}% · 소요 시간 {timeStr}
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="맞은 문제" value={result.correct} color="text-green-600" />
          <Stat
            label="틀린 문제"
            value={result.wrongList.length}
            color="text-red-500"
          />
        </div>

        {/* 임시 placeholder 안내 */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-[13px] font-bold text-gray-700 mb-1">
            오답 리뷰는 5단계에서 추가될 예정이에요
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            지금은 점수만 표시되고, 곧 틀린 문제별 정답/풀이도 확인할 수 있게 됩니다.
          </p>
        </div>

        {/* 액션 */}
        <div className="space-y-2">
          <Link
            href="/web/cbt/select"
            className="block w-full text-center bg-gray-900 active:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            다른 시험 풀러 가기
          </Link>
          <Link
            href="/web/cbt"
            className="block w-full text-center bg-gray-100 active:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
          >
            CBT 홈
          </Link>
        </div>
      </div>
    </div>
  );
}

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
    <div className="bg-gray-50 rounded-2xl p-4 text-center">
      <p className="text-[11px] font-bold text-gray-500">{label}</p>
      <p className={`text-2xl font-extrabold tabular-nums mt-1 ${color}`}>
        {value}
      </p>
    </div>
  );
}
