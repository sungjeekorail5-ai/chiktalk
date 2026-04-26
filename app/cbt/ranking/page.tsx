import Link from "next/link";

export default function CbtRankingPage() {
  return (
    <div className="max-w-md mx-auto px-5 py-12 text-center space-y-4">
      <div className="text-4xl">🏆</div>
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
        랭킹
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed">
        무한 퀴즈 TOP 100 — 7단계에서 구현 예정
      </p>
      <Link
        href="/cbt"
        className="inline-block bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm"
      >
        CBT 홈으로
      </Link>
    </div>
  );
}
