"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * /cbt/quiz — 풀이 화면 (다음 단계에서 구현)
 *
 * 현재는 자리표시(placeholder) 화면.
 * 4단계 작업에서 본격 구현 예정.
 */
function QuizPlaceholder() {
  const params = useSearchParams();
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    const obj: Record<string, string> = {};
    params.forEach((v, k) => {
      obj[k] = v;
    });
    setInfo(obj);
  }, [params]);

  return (
    <div className="max-w-md mx-auto px-5 py-12 text-center space-y-5">
      <div className="text-4xl">🚧</div>
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
        퀴즈 화면 — 다음 단계 작업 예정
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed">
        선택 정보가 정상적으로 넘어왔는지 확인하는 임시 화면이에요.
        다음 메시지에서 실제 풀이 UI를 구현할게요.
      </p>

      <div className="bg-gray-50 rounded-2xl p-4 text-left">
        <p className="text-xs font-bold text-gray-700 mb-2">받은 파라미터</p>
        <pre className="text-[11px] font-mono text-gray-600 whitespace-pre-wrap">
          {Object.keys(info).length === 0
            ? "(없음)"
            : JSON.stringify(info, null, 2)}
        </pre>
      </div>

      <Link
        href="/web/cbt"
        className="inline-block bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm"
      >
        CBT 홈으로
      </Link>
    </div>
  );
}

export default function CbtQuizPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400 font-bold">로딩...</div>}>
      <QuizPlaceholder />
    </Suspense>
  );
}
