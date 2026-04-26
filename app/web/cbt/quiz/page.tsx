import { Suspense } from "react";
import QuizClient from "./QuizClient";

export default function CbtQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-500">문제 준비 중...</p>
          </div>
        </div>
      }
    >
      <QuizClient />
    </Suspense>
  );
}
