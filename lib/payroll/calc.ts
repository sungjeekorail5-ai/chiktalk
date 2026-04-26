// 🚂 코레일 급여계산기 — 계산 로직 (순수 함수)
//
// 원본: korail_payroll/lib/user_data.dart 의 모든 getter
// + 픽스 #1: longServicePay → longServiceBaseDate 사용 (호봉제만 합산되니 OK)
// + 픽스 #2: ratio → workingDays / 그 달의 실제 일수
//
// 모든 함수는 UserData를 받아 number(원) 반환하는 순수 함수.

import {
  FIXED_JOB_PAY,
  HOURLY_WAGE_DIVISOR,
  JOB_ROLE_LEVEL_TABLE,
  RATIO_PAY_TABLE,
  SAFETY_BASE_ADD_PAY,
  SERVICE_PAY,
} from "./tables";
import type { AllowanceWinnerType, UserData } from "./types";

// ─────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────
export function fNum(val: number): string {
  return Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function fDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * 그 달의 일수 (28~31)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * calculationMonth(ISO string) 기준 그 달의 일수
 */
export function maxDaysOfCalcMonth(user: UserData): number {
  const d = new Date(user.calculationMonth);
  return getDaysInMonth(d.getFullYear(), d.getMonth() + 1);
}

/**
 * 일할계산 비율 (BUG #2 픽스 적용: 분모를 31 고정 → 그 달 일수)
 */
export function workingDaysRatio(user: UserData): number {
  const max = maxDaysOfCalcMonth(user);
  return user.workingDays / max;
}

// ─────────────────────────────────────────────────────
// 기본급 / 정률
// ─────────────────────────────────────────────────────
export function basePay(user: UserData): number {
  if (user.isSalarySystem && (user.grade === 3 || user.grade === 4)) {
    return user.basePayInput;
  }
  const jobPay = FIXED_JOB_PAY[user.grade] ?? 0;
  const srvPay = SERVICE_PAY[user.step] ?? 0;
  return jobPay + srvPay;
}

export function ratioBasePay(user: UserData): number {
  return RATIO_PAY_TABLE[user.grade]?.[user.step] ?? 0;
}

// ─────────────────────────────────────────────────────
// 대우수당 / 조정수당
// ─────────────────────────────────────────────────────
export function daewooPay(user: UserData): number {
  if (user.isSalarySystem && user.grade < 5) return 0;

  const calc = new Date(user.calculationMonth);
  const promo = new Date(user.promotionDate);
  const months =
    (calc.getFullYear() - promo.getFullYear()) * 12 +
    (calc.getMonth() - promo.getMonth());

  if (months >= 60) {
    return Math.floor(ratioBasePay(user) * 0.04);
  }
  return 0;
}

export function adjustmentPay(user: UserData): number {
  if (user.isSalarySystem && user.grade < 5) return 0;

  let rate = 0;
  if (user.workType.includes("통상일근")) rate = 0.005;
  else if (user.workType.includes("3조2교대") || user.workType.includes("4조2교대"))
    rate = 0.019;
  else if (user.workType.includes("야간격일제")) rate = 0.011;
  else if (user.workType.includes("교번")) rate = 0.051;

  return Math.floor(ratioBasePay(user) * rate);
}

// ─────────────────────────────────────────────────────
// 식비 / 상여 / 명절상여
// ─────────────────────────────────────────────────────
export function foodPay(): number {
  return 200000;
}

export function bonusPay(user: UserData): number {
  // 경영평가성과급 (160%)
  if (user.isSalarySystem && (user.grade === 3 || user.grade === 4)) {
    return Math.floor(((basePay(user) + safetyConversionPay(user)) * 1.6) / 12);
  }
  return Math.floor((basePay(user) * 1.6) / 12);
}

export function traHolidayBonusPay(user: UserData): number {
  // 명절상여금 (설+추석)
  // 호봉제: (basePay × 1.2 + 608,000) / 12
  // 연봉제 3·4급: (holidayBonusInput × 2 + 608,000) / 12  ← *2 = 설+추석 합산
  // 연봉제 5·6급: holidayBonusInput / 12
  if (user.isSalarySystem && (user.grade === 3 || user.grade === 4)) {
    return Math.floor((user.holidayBonusInput * 2 + 608000) / 12);
  }
  if (user.isSalarySystem) {
    return Math.floor(user.holidayBonusInput / 12);
  }
  return Math.floor((basePay(user) * 1.2 + 608000) / 12);
}

// ─────────────────────────────────────────────────────
// 장기근속수당 (BUG #1 픽스 적용)
// ─────────────────────────────────────────────────────
export function longServicePay(user: UserData): number {
  // 픽스: calculationMonth(=DateTime.now()) → longServiceBaseDate(사용자 입력)
  // 호봉제만 totalRegulatedWage에 합산되므로 연봉제는 영향 없음.
  const base = new Date(user.longServiceBaseDate);
  const hire = new Date(user.hireDate);
  const totalMonths =
    (base.getFullYear() - hire.getFullYear()) * 12 +
    (base.getMonth() - hire.getMonth()) +
    user.addServiceMonths;
  const years = totalMonths / 12;

  if (years >= 25) return 150000;
  if (years >= 20) return 130000;
  if (years >= 15) return 110000;
  if (years >= 10) return 90000;
  if (years >= 5) return 70000;
  return 0;
}

// ─────────────────────────────────────────────────────
// 가족수당
// ─────────────────────────────────────────────────────
export function totalFamilyPay(user: UserData): number {
  let total = 0;

  // 1·2급은 자녀수당만
  if (user.grade <= 2) {
    if (user.childCount >= 1) total += 50000;
    if (user.childCount >= 2) total += 80000;
    if (user.childCount >= 3) total += (user.childCount - 2) * 120000;
    return total;
  }

  if (user.spouseCount > 0) total += 30000;

  if (user.childCount >= 1) total += 50000;
  if (user.childCount >= 2) total += 80000;
  if (user.childCount >= 3) total += (user.childCount - 2) * 120000;

  // 배우자 + 기타 ≤ 4명
  const availableSlots = 4 - user.spouseCount;
  if (availableSlots > 0) {
    const applyOther =
      user.otherFamilyCount > availableSlots
        ? availableSlots
        : user.otherFamilyCount;
    total += applyOther * 20000;
  }
  return total;
}

// ─────────────────────────────────────────────────────
// 특별업무수당 (다중 선택, 합산 20만 캡)
// ─────────────────────────────────────────────────────
export function specialTaskPayTotal(user: UserData): number {
  const total = user.selectedSpecialTasks.reduce((sum, v) => sum + v, 0);
  return total > 200000 ? 200000 : total;
}

// ─────────────────────────────────────────────────────
// 승무수당 (실 승무일수 기반 + km 기반 분기)
// ─────────────────────────────────────────────────────
function _calcDrivePay(
  user: UserData,
  km: number,
  days: number
): number {
  const { trainCategory, driveRole, series } = user;

  if (trainCategory === "고속열차") {
    if (driveRole === "KTX기장") return km * 110;
    if (driveRole === "지원기장") {
      const pay = km * 110;
      return pay > 600000 ? 600000 : pay;
    }
    if (driveRole.includes("열차팀장")) {
      const pay = km * 28;
      return pay > 200000 ? 200000 : pay;
    }
    if (driveRole.includes("지도운용팀장"))
      return days >= 10 ? 400000 : (400000 / 10) * days;
  }

  if (trainCategory === "일반열차") {
    if (driveRole === "기관사" || driveRole === "지원기관사")
      return days >= 17 ? 220000 : (220000 / 17) * days;
    if (driveRole.includes("부기관사"))
      return days >= 17 ? 100000 : (100000 / 17) * days;
    if (driveRole.includes("여객전무"))
      return days >= 17 ? 30000 : (30000 / 17) * days;
    if (driveRole.includes("지도운용팀장"))
      return days >= 10 ? 220000 : (220000 / 10) * days;
  }

  if (trainCategory === "수도권전동열차") {
    if (
      driveRole === "기관사" ||
      driveRole === "지원기관사" ||
      driveRole === "전철기관사"
    )
      return days >= 17 ? 220000 : (220000 / 17) * days;
    if (driveRole.includes("전철차장"))
      return days >= 17 ? 30000 : (30000 / 17) * days;
    if (driveRole.includes("지도운용팀장"))
      return days >= 10 ? 220000 : (220000 / 10) * days;
  }

  if (trainCategory === "특별동차") {
    if (
      driveRole === "KTX기장" ||
      driveRole.includes("지도운용팀장") ||
      driveRole.includes("선임지도팀장")
    ) {
      return days >= 17 ? 600000 : (600000 / 17) * days;
    }
    if (driveRole.includes("열차팀장"))
      return days >= 17 ? 70000 : (70000 / 17) * days;
  }

  if (series === "열차승무" || series === "운전") return 150000;
  return 0;
}

function _calcSoloDrivePay(user: UserData, km: number, days: number): number {
  const hireYear = new Date(user.hireDate).getFullYear();
  if (hireYear >= 2014 && !user.isSoloWithoutCrew) return 0;

  const r = user.driveRole;
  if (
    r === "KTX기장" ||
    r === "지원기장" ||
    r === "기관사" ||
    r === "지원기관사" ||
    r === "전철기관사" ||
    r.includes("지도운용팀장")
  ) {
    return days >= 17 ? 500000 : (500000 / 17) * days;
  }

  if (r.includes("여객전무")) {
    let ratio = 0;
    if (user.passengerCars >= 7) ratio = 1.0;
    else if (user.passengerCars >= 5) ratio = 0.7;
    else if (user.passengerCars > 0) ratio = 0.3;

    const pay = km * 60 * ratio;
    return pay > 200000 ? 200000 : pay;
  }
  return 0;
}

export function drivePay(user: UserData): number {
  return Math.floor(_calcDrivePay(user, user.drivingKm, user.drivingDays));
}
export function soloDrivePay(user: UserData): number {
  return Math.floor(_calcSoloDrivePay(user, user.drivingKm, user.drivingDays));
}
export function statutoryDrivePay(user: UserData): number {
  // 통상임금용 — 계획 주행거리 + 17일 가정
  return Math.floor(_calcDrivePay(user, user.plannedDrivingKm, 17));
}
export function statutorySoloDrivePay(user: UserData): number {
  if (!user.isDedicatedSoloDept) return 0;
  return Math.floor(_calcSoloDrivePay(user, user.plannedDrivingKm, 17));
}

// ─────────────────────────────────────────────────────
// 유리한 수당 1개만 선택 (선임장 vs 특별업무 vs 승무수당)
// ─────────────────────────────────────────────────────
export function bestStatutoryAllowanceType(user: UserData): AllowanceWinnerType {
  let max = 0;
  let best: AllowanceWinnerType = "NONE";
  if (user.seniorPay > max) {
    max = user.seniorPay;
    best = "SENIOR";
  }
  const sp = specialTaskPayTotal(user);
  if (sp > max) {
    max = sp;
    best = "SPECIAL";
  }
  const sd = statutoryDrivePay(user);
  if (sd > max) {
    max = sd;
    best = "DRIVE";
  }
  return best;
}

export function bestActualAllowanceType(user: UserData): AllowanceWinnerType {
  let max = 0;
  let best: AllowanceWinnerType = "NONE";
  if (user.seniorPay > max) {
    max = user.seniorPay;
    best = "SENIOR";
  }
  const sp = specialTaskPayTotal(user);
  if (sp > max) {
    max = sp;
    best = "SPECIAL";
  }
  const dp = drivePay(user);
  if (dp > max) {
    max = dp;
    best = "DRIVE";
  }
  return best;
}

export function appliedSeniorPay(user: UserData): number {
  return bestActualAllowanceType(user) === "SENIOR" ? user.seniorPay : 0;
}
export function appliedSpecialPay(user: UserData): number {
  return bestActualAllowanceType(user) === "SPECIAL"
    ? specialTaskPayTotal(user)
    : 0;
}
export function appliedDrivePay(user: UserData): number {
  return bestActualAllowanceType(user) === "DRIVE" ? drivePay(user) : 0;
}
export function appliedSoloDrivePay(user: UserData): number {
  return soloDrivePay(user);
}

// ─────────────────────────────────────────────────────
// 안전역할급 (연봉제 3·4급)
// ─────────────────────────────────────────────────────
export function safetyConversionPay(user: UserData): number {
  return user.isSalarySystem && (user.grade === 3 || user.grade === 4)
    ? 160000
    : 0;
}

export function safetyBaseAddPay(user: UserData): number {
  return SAFETY_BASE_ADD_PAY[user.safetyRoleGrade] ?? 0;
}

export function jobRoleLevelAddPay(user: UserData): number {
  if (user.jobRoleGrade === "해당없음" || user.deptCategory === "해당없음")
    return 0;

  // 근무형태 단순화: 교대(교대/야간 포함) / 교번 / 통상일근
  let simplified: string;
  if (user.workType.includes("교대") || user.workType.includes("야간")) {
    simplified = "교대";
  } else if (user.workType.includes("교번")) {
    simplified = "교번";
  } else {
    simplified = "통상일근";
  }
  const key = `${user.grade}-${user.deptCategory}-${simplified}-${user.jobRoleGrade}`;
  return JOB_ROLE_LEVEL_TABLE[key] ?? 0;
}

export function totalSafetyAddPay(user: UserData): number {
  // 5·6급 연봉제는 안전역할가산금이 대우+조정수당으로 치환됨 (체크리스트 ⑥-3)
  if (user.isSalarySystem && (user.grade === 5 || user.grade === 6)) {
    return daewooPay(user) + adjustmentPay(user);
  }
  return safetyBaseAddPay(user) + jobRoleLevelAddPay(user);
}

// ─────────────────────────────────────────────────────
// 통상임금 / 시급
// ─────────────────────────────────────────────────────
export function hourlyWageDivisor(user: UserData): number {
  return HOURLY_WAGE_DIVISOR[user.workType] ?? 209;
}

/**
 * 규정 통상임금 합계
 * 호봉제: 기본+대우+조정+기술+위험+장기
 * 연봉제: 기준급+전환금+가산금+기술
 */
export function totalRegulatedWage(user: UserData): number {
  if (user.isSalarySystem) {
    return Math.floor(
      basePay(user) +
        safetyConversionPay(user) +
        totalSafetyAddPay(user) +
        user.techPay +
        user.techAddPay
    );
  }
  return Math.floor(
    basePay(user) +
      daewooPay(user) +
      adjustmentPay(user) +
      user.techPay +
      user.techAddPay +
      user.dangerPay +
      longServicePay(user)
  );
}

/**
 * 법정 통상임금 합계 (규정 + 유리한수당 + 1인전담 + 식비 + 상여 + 명절상여)
 */
export function totalStatutoryWage(user: UserData): number {
  const winner = bestStatutoryAllowanceType(user);
  let bestAllowance = 0;
  if (winner === "SENIOR") bestAllowance = user.seniorPay;
  else if (winner === "SPECIAL") bestAllowance = specialTaskPayTotal(user);
  else if (winner === "DRIVE") bestAllowance = statutoryDrivePay(user);

  if (user.isSalarySystem) {
    let statSolo = user.isSubstituteDrive ? statutorySoloDrivePay(user) : 0;
    if (!user.isSubstituteDrive && winner === "DRIVE") bestAllowance = 0;
    return Math.floor(
      basePay(user) +
        safetyConversionPay(user) +
        totalSafetyAddPay(user) +
        user.techPay +
        user.techAddPay +
        foodPay() +
        bestAllowance +
        statSolo +
        traHolidayBonusPay(user) +
        bonusPay(user)
    );
  }

  return Math.floor(
    basePay(user) +
      daewooPay(user) +
      adjustmentPay(user) +
      user.techPay +
      user.techAddPay +
      user.dangerPay +
      longServicePay(user) +
      bestAllowance +
      statutorySoloDrivePay(user) +
      foodPay() +
      bonusPay(user) +
      traHolidayBonusPay(user)
  );
}

export function regulatedHourlyWage(user: UserData): number {
  return Math.floor(totalRegulatedWage(user) / hourlyWageDivisor(user));
}

export function statutoryHourlyWage(user: UserData): number {
  return Math.floor(totalStatutoryWage(user) / hourlyWageDivisor(user));
}

// ─────────────────────────────────────────────────────
// 실적수당 (시간외/야간/휴일/연차)
// ─────────────────────────────────────────────────────
export function annualLeavePay(user: UserData): number {
  return Math.round(user.annualLeaveDays * 8 * regulatedHourlyWage(user));
}

export function actualPerformancePay(user: UserData): number {
  // 실적수당은 법정 시급 기준 (앱 코드와 동일)
  const hourlyWage = statutoryHourlyWage(user);
  const overtimePay = Math.round(user.overtimeHours * hourlyWage * 1.5);
  const nightPay = Math.round(user.nightHours * hourlyWage * 0.5);
  const holiday1Pay = Math.round(user.holiday1Hours * hourlyWage * 1.5);
  const holiday2Pay = Math.round(user.holiday2Hours * hourlyWage * 2.0);
  return overtimePay + nightPay + holiday1Pay + holiday2Pay + annualLeavePay(user);
}
