"use client";

import { useEffect, useState } from "react";

/**
 * CBT 문제 이미지 — 로드 실패 시 친절한 안내 박스로 폴백.
 * 원본 코레일CBT 앱의 errorBuilder와 동일한 UX.
 */
export default function QuestionImage({
  src,
  alt = "문제 이미지",
  className = "w-full h-auto max-h-[40vh] object-contain",
  containerClassName = "rounded-2xl overflow-hidden bg-gray-100",
}: {
  src: string | undefined | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
}) {
  const [error, setError] = useState(false);

  // 새 src가 들어오면 에러 상태 리셋
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src) return null;

  if (error) {
    return (
      <div className="bg-gray-100 text-gray-500 px-4 py-6 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
        이미지를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}
