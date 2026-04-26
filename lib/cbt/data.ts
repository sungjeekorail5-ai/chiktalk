// 🚂 코레일 CBT 데이터 로딩 + 헬퍼
// 정적 JSON을 클라이언트에서 한 번만 fetch하고 메모리에 캐싱

import type {
  Question,
  RawQuestion,
  ExamSelection,
  InfiniteSelection,
} from "./types";

const QUESTIONS_URL = "/cbt/questions.json";
const AI_QUESTIONS_URL = "/cbt/ai-questions.json";

// 메모리 캐시 (한 세션 동안 유지)
let _questionsCache: Question[] | null = null;
let _aiQuestionsCache: Question[] | null = null;
let _loadingPromise: Promise<{
  questions: Question[];
  aiQuestions: Question[];
}> | null = null;

function rawToQuestion(raw: RawQuestion, isAI: boolean): Question {
  // 안정적인 고유 ID
  const id = isAI
    ? `AI-${raw.source ?? raw.category ?? "x"}-${raw.no}`
    : `${raw.year}-${raw.round}-${raw.major}-${raw.type}-${raw.subject}-${raw.no}`;

  // 이미지 경로를 웹용으로 변환
  // "assets/images/..."  →  "/cbt/images/..."
  let imageUrl: string | undefined;
  if (raw.image) {
    imageUrl = raw.image.startsWith("assets/images/")
      ? "/cbt/" + raw.image.substring("assets/".length) // -> /cbt/images/...
      : raw.image;
  }

  return {
    ...raw,
    id,
    imageUrl,
    isAI,
  };
}

/**
 * 데이터 한 번에 로딩 (캐시됨, 동시 호출 시 동일 promise 공유)
 */
export async function loadCbtData(): Promise<{
  questions: Question[];
  aiQuestions: Question[];
}> {
  if (_questionsCache && _aiQuestionsCache) {
    return { questions: _questionsCache, aiQuestions: _aiQuestionsCache };
  }
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = (async () => {
    const [qRes, aiRes] = await Promise.all([
      fetch(QUESTIONS_URL),
      fetch(AI_QUESTIONS_URL),
    ]);
    if (!qRes.ok || !aiRes.ok) {
      throw new Error("CBT 데이터를 불러오지 못했습니다.");
    }
    const [rawQs, rawAi] = await Promise.all([
      qRes.json() as Promise<RawQuestion[]>,
      aiRes.json() as Promise<RawQuestion[]>,
    ]);

    _questionsCache = rawQs.map((r) => rawToQuestion(r, false));
    // AI 문제는 year='AI'로 통일
    _aiQuestionsCache = rawAi.map((r) =>
      rawToQuestion({ ...r, year: "AI", round: "", major: "", type: "AI" }, true)
    );

    return { questions: _questionsCache, aiQuestions: _aiQuestionsCache };
  })();

  return _loadingPromise;
}

// ─────────────────────────────────────────────────────────
// 출제 로직
// ─────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 기출 모드 출제 — 선택된 연도 + 직렬 + 과목으로 필터.
 * '전체 풀기'면 직렬에 속한 각 과목별로 20문제씩 셔플 추출 (총 60문제).
 * 단일 과목이면 그 과목에서 20문제 셔플 추출.
 */
export function pickExamQuestions(
  all: Question[],
  selection: ExamSelection,
  perSubject: number = 20
): Question[] {
  const base = all.filter(
    (q) =>
      selection.years.includes(q.year) && q.major === selection.major
  );
  if (base.length === 0) return [];

  if (selection.subject === "전체 풀기") {
    const subjects = Array.from(new Set(base.map((q) => q.subject)));
    const result: Question[] = [];
    for (const sub of subjects) {
      const pool = base.filter((q) => q.subject === sub);
      result.push(...shuffle(pool).slice(0, perSubject));
    }
    return result;
  }

  const pool = base.filter((q) => q.subject === selection.subject);
  return shuffle(pool).slice(0, perSubject);
}

/**
 * 무한 모드 출제 풀
 *  - sourceName === '통합'  → 전체 AI 문제
 *  - sourceName === '전체'  → category 일치
 *  - 그 외  → source 일치
 */
export function pickInfinitePool(
  aiAll: Question[],
  selection: InfiniteSelection
): Question[] {
  let pool: Question[];
  if (selection.source === "통합") {
    pool = aiAll;
  } else if (selection.source === "전체") {
    pool = aiAll.filter((q) => q.category === selection.category);
  } else {
    pool = aiAll.filter((q) => q.source === selection.source);
  }
  return shuffle(pool);
}

/**
 * AI 문제의 출처(사규) 목록 — 카테고리별로 그룹핑
 */
export function getSourcesByCategory(
  aiAll: Question[],
  category: string
): string[] {
  const sources = new Set<string>();
  for (const q of aiAll) {
    if (q.category === category && q.source) {
      sources.add(q.source);
    }
  }
  return Array.from(sources).sort();
}

export function getAiCategories(aiAll: Question[]): string[] {
  const cats = new Set<string>();
  for (const q of aiAll) {
    if (q.category) cats.add(q.category);
  }
  return Array.from(cats).sort();
}

// ─────────────────────────────────────────────────────────
// 채점
// ─────────────────────────────────────────────────────────

/**
 * 정답 여부 판정
 * @param userIndex 사용자가 클릭한 보기 인덱스 (0-based, 미응답이면 -1)
 * @param answer    정답 번호 (1-based)
 */
export function isCorrect(userIndex: number, answer: number): boolean {
  return userIndex !== -1 && userIndex + 1 === answer;
}
