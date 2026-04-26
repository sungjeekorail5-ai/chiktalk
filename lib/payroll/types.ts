// 🚂 코레일 급여계산기 — 모델 타입
// 원본: korail_payroll/lib/user_data.dart

export type SeriesType =
  | "사무영업"
  | "열차승무"
  | "운전"
  | "차량"
  | "토목"
  | "건축"
  | "전기통신";

export type WorkType =
  | "통상일근_209"
  | "3조2교대_216"
  | "4조2교대(기본형)_216"
  | "4조2교대(야간형)_212"
  | "야간격일제_187"
  | "교번_242";

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export type SafetyRoleGrade =
  | "해당없음"
  | "G-S1"
  | "G-S2"
  | "G-S3"
  | "G-S4"
  | "G-S5"
  | "G-S6-1"
  | "G-S6-2"
  | "G-S7"
  | "G-S8"
  | "G-S9"
  | "G-S10"
  | "G-S11"
  | "G-S12"
  | "G-S13";

export type JobRoleGrade = "해당없음" | "S" | "A" | "B" | "C" | "D";

export type DeptCategory =
  | "해당없음"
  // 3급
  | "본사"
  | "지역·부속팀장"
  | "지역·부속기관(관리지원)"
  | "역·소장"
  // 4급
  | "본사·지역·부속(관리지원)"
  | "현업팀장(열차팀장 제외)";

export type TrainCategory =
  | "고속열차"
  | "일반열차"
  | "수도권전동열차"
  | "특별동차";

export type DriveRole = string; // 차종에 따라 동적으로 결정 (KTX기장, 지원기장, 기관사 등)

export type AllowanceWinnerType = "NONE" | "SENIOR" | "SPECIAL" | "DRIVE";

/**
 * 사용자 입력 데이터 (UserData)
 *
 * 원본 Dart class UserData를 그대로 옮긴 형태.
 * 날짜는 ISO 문자열로 저장(JSON 직렬화 친화적).
 */
export interface UserData {
  // ── 1. 기본 정보 ──
  isSalarySystem: boolean; // 연봉제 여부
  isSubstituteDrive: boolean; // 연봉제 - 대체승무
  series: SeriesType;
  workType: WorkType;
  grade: Grade;
  step: number; // 1~35

  basePayInput: number; // 3·4급 연봉제용 본인 기준급
  holidayBonusInput: number; // 연봉제용 명절상여금 (한 번 받는 금액)

  hireDate: string; // ISO date string
  promotionDate: string;
  workingDays: number;
  calculationMonth: string; // 현재는 화면에서 변경 불가, DateTime.now() 초기값

  safetyRoleGrade: SafetyRoleGrade;
  jobRoleGrade: JobRoleGrade;
  deptCategory: DeptCategory;

  // ── 2. 가족 / 장기근속 / 승무 / 기타 ──
  spouseCount: number;
  childCount: number;
  otherFamilyCount: number;
  longServiceBaseDate: string;
  addServiceMonths: number;

  isDedicatedSoloDept: boolean;
  trainCategory: TrainCategory;
  driveRole: DriveRole;

  drivingDays: number;
  drivingKm: number;
  plannedDrivingKm: number;
  passengerCars: number;
  isSoloWithoutCrew: boolean;

  seniorPay: number;
  techPay: number;
  techAddPay: number;
  dangerPay: number;
  selectedSpecialTasks: number[];

  // ── 실적 ──
  overtimeHours: number;
  nightHours: number;
  holiday1Hours: number;
  holiday2Hours: number;
  annualLeaveDays: number;
}

/**
 * 초기값 — UserData 기본 상태
 */
export function createDefaultUserData(): UserData {
  const now = new Date().toISOString();
  return {
    isSalarySystem: false,
    isSubstituteDrive: false,
    series: "사무영업",
    workType: "통상일근_209",
    grade: 6,
    step: 1,
    basePayInput: 0,
    holidayBonusInput: 0,
    hireDate: now,
    promotionDate: now,
    workingDays: 31,
    calculationMonth: now,
    safetyRoleGrade: "해당없음",
    jobRoleGrade: "해당없음",
    deptCategory: "해당없음",
    spouseCount: 0,
    childCount: 0,
    otherFamilyCount: 0,
    longServiceBaseDate: now,
    addServiceMonths: 0,
    isDedicatedSoloDept: false,
    trainCategory: "고속열차",
    driveRole: "KTX기장",
    drivingDays: 17,
    drivingKm: 0,
    plannedDrivingKm: 0,
    passengerCars: 0,
    isSoloWithoutCrew: false,
    seniorPay: 0,
    techPay: 0,
    techAddPay: 0,
    dangerPay: 0,
    selectedSpecialTasks: [],
    overtimeHours: 0,
    nightHours: 0,
    holiday1Hours: 0,
    holiday2Hours: 0,
    annualLeaveDays: 0,
  };
}

/**
 * 차종 → 직책 매핑 (input_screen._getDriveRoles)
 */
export const DRIVE_ROLES_BY_TRAIN: Record<TrainCategory, string[]> = {
  고속열차: ["KTX기장", "지원기장", "열차팀장", "지원열차팀장", "지도운용팀장(고속)"],
  일반열차: [
    "기관사",
    "지원기관사",
    "부기관사",
    "지원부기관사",
    "여객전무",
    "지원여객전무",
    "광역지원여객전무",
    "지도운용팀장",
  ],
  수도권전동열차: ["기관사", "지원기관사", "전철차장", "지원전철차장", "지도운용팀장"],
  특별동차: ["KTX기장", "지도운용팀장", "선임지도팀장", "열차팀장"],
};

/**
 * 급수별 소속분류 옵션 (input_screen._getDeptOptions)
 */
export function getDeptOptionsByGrade(grade: Grade): DeptCategory[] {
  if (grade === 3)
    return ["해당없음", "본사", "지역·부속팀장", "지역·부속기관(관리지원)", "역·소장"];
  if (grade === 4)
    return [
      "해당없음",
      "본사·지역·부속(관리지원)",
      "지역·부속팀장",
      "현업팀장(열차팀장 제외)",
    ];
  return ["해당없음"];
}

/**
 * 특별업무수당 항목 (가격 → 라벨)
 */
export const SPECIAL_TASK_LABELS: Record<number, string> = {
  100000: "안전/보건관리자(10만)",
  90000: "전철보수장비 운전겸직(전기)(9만)",
  85000: "무선제어 입환업무 겸직(8.5만)",
  70000: "안전보건담당자/전기안전관리자(7만)",
  55000: "시설분야 관리장/원(일근)(5.5만)",
  50000: "입환/조성/모터카운전겸직(5만)",
  35000: "시설/전기/차량/장비관리분야(3.5만)",
  30000: "위험물/고압가스/무선/보조자(3만)",
};
