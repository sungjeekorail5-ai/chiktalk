// 🚂 코레일 CBT 데이터 타입
// 원본: korail_CBT/lib/models/question_model.dart

export interface RawQuestion {
  year: string; // "2022" ~ "2025" or "AI"
  round: string; // "1회", "2회"
  major: string; // 직렬 (사무영업, 운전, 차량 ...)
  type: string; // "A" | "B" | "AI"
  subject: string; // 과목명
  no: number; // 문제 번호
  question: string;
  options: string[]; // 보통 4개
  answer: number; // 정답 번호 (1-based, 1~4)
  image?: string; // 도식 이미지 경로 (예: "assets/images/2022-1_사무영업_A_16.png")
  source?: string; // AI 문제 출처 (사규명)
  category?: string; // AI 문제 카테고리
  explanation?: string; // AI 문제 정답 풀이
}

export interface Question extends RawQuestion {
  id: string; // 안정적인 고유 ID — `${year}-${round}-${major}-${type}-${subject}-${no}` 또는 AI는 `AI-${source}-${no}`
  imageUrl?: string; // 웹용 변환된 이미지 경로 (/cbt/images/...)
  isAI: boolean;
}

// 퀴즈 모드
export type QuizMode = "exam" | "infinite" | "wrong";

// 사용자가 답한 결과
export interface QuizAttempt {
  questionId: string;
  selectedIndex: number; // 0-based (UI에서 보기 클릭한 인덱스)
  isCorrect: boolean;
}

// 시험 선택 결과
export interface ExamSelection {
  years: string[]; // 다중 선택
  major: string;
  subject: string; // "전체 풀기" 또는 특정 과목
}

// AI 무한 퀴즈 선택
export interface InfiniteSelection {
  category: string; // "공통사항" | "여객·화물관계사규" | "운전관계사규" | "통합문제"
  source: string; // 사규명 또는 "전체" | "통합"
  major?: string;
}

// 풀이 결과
export interface QuizResult {
  mode: QuizMode;
  total: number;
  correct: number;
  score: number; // 일반적으로 correct
  durationSeconds: number;
  questions: Question[];
  userAnswers: number[]; // -1 = 미응답, 그 외 = 0-based index
  wrongList: Array<{ question: Question; selectedIndex: number }>;
}

// 직렬 → 과목 맵핑 (Flutter 원본과 동일)
export const SUBJECTS_BY_MAJOR: Record<string, string[]> = {
  사무영업: ["운전관계사규", "여객·화물관계사규", "철도안전관리"],
  운전: ["운전관계사규", "기술·운전이론", "철도안전관리"],
  "운전(고속)": ["운전관계사규", "기술·운전이론", "철도안전관리"],
  "운전(일반)": ["운전관계사규", "기술·운전이론", "철도안전관리"],
  차량: ["차량관계사규", "철도차량공학", "철도안전관리"],
  토목: ["토목관계사규", "철도공학", "철도안전관리"],
  건축: ["건축관계사규", "건축시공 및 건축기계설비", "철도안전관리"],
  전기통신: ["전기통신관계사규", "전기이론", "철도안전관리"],
  신호제어: ["신호제어관계사규", "전기이론", "철도안전관리"],
};

export const ALL_YEARS = ["2022", "2023", "2024", "2025"] as const;

/**
 * 선택된 연도들에 따라 표시할 직렬 목록을 반환
 *
 * 규칙 (Flutter 원본 SelectionScreen._getMajors와 동일):
 *   - 사무영업, 차량, 토목, 전기통신, 신호제어: 항상
 *   - 운전: 2024 단독이면 "운전(고속)/(일반)" 분기, 다른 연도와 함께면 통합 "운전"
 *   - 건축: 2023 제외 모든 연도
 */
export function getMajorsForYears(years: string[]): string[] {
  const majors: string[] = ["사무영업"];

  const only2024 = years.length === 1 && years.includes("2024");
  if (only2024) {
    majors.push("운전", "운전(고속)", "운전(일반)");
  } else {
    majors.push("운전");
  }

  majors.push("차량", "토목");

  if (years.some((y) => y !== "2023")) majors.push("건축");

  majors.push("전기통신", "신호제어");
  return majors;
}
