"use client";

import { useState } from "react";
import type { UserData } from "@/lib/payroll/types";
import {
  actualPerformancePay,
  adjustmentPay,
  annualLeavePay,
  appliedDrivePay,
  appliedSeniorPay,
  appliedSoloDrivePay,
  appliedSpecialPay,
  basePay,
  bestActualAllowanceType,
  bestStatutoryAllowanceType,
  bonusPay,
  daewooPay,
  drivePay,
  fNum,
  foodPay,
  hourlyWageDivisor,
  longServicePay,
  ratioBasePay,
  regulatedHourlyWage,
  safetyConversionPay,
  soloDrivePay,
  specialTaskPayTotal,
  statutoryDrivePay,
  statutoryHourlyWage,
  statutorySoloDrivePay,
  totalFamilyPay,
  totalRegulatedWage,
  totalSafetyAddPay,
  totalStatutoryWage,
  traHolidayBonusPay,
  workingDaysRatio,
} from "@/lib/payroll/calc";

export type ResultMode = "WAGE_COMPARE" | "PAY_CHECK";

export default function ResultView({
  user,
  mode,
}: {
  user: UserData;
  mode: ResultMode;
}) {
  const [isStatutory, setIsStatutory] = useState(false);

  // 메인 합계
  const total =
    mode === "WAGE_COMPARE"
      ? isStatutory
        ? totalStatutoryWage(user)
        : totalRegulatedWage(user)
      : calcActualTotalPay(user);

  return (
    <div className="px-4 md:px-5 py-4 space-y-3">
      {/* 모드 토글 (통상임금에서만) */}
      {mode === "WAGE_COMPARE" && (
        <ModeToggle isStatutory={isStatutory} onChange={setIsStatutory} />
      )}

      {/* 메인 색 카드 */}
      <MainCard
        user={user}
        mode={mode}
        isStatutory={isStatutory}
        total={total}
      />

      {/* 디테일 카드 */}
      <DetailCard user={user} mode={mode} isStatutory={isStatutory} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 1. 모드 토글 (규정 / 법정)
// ────────────────────────────────────────────────────────────────
function ModeToggle({
  isStatutory,
  onChange,
}: {
  isStatutory: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-gray-200 rounded-full">
      {[
        { label: "규정 시급으로 계산", val: false },
        { label: "법정 시급으로 계산", val: true },
      ].map((t) => {
        const active = isStatutory === t.val;
        return (
          <button
            key={t.label}
            onClick={() => onChange(t.val)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              active
                ? "bg-white text-blue-700 shadow-sm font-extrabold"
                : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 2. 메인 색 카드 (호봉제=파랑, 연봉제=오렌지)
// ────────────────────────────────────────────────────────────────
function MainCard({
  user,
  mode,
  isStatutory,
  total,
}: {
  user: UserData;
  mode: ResultMode;
  isStatutory: boolean;
  total: number;
}) {
  const isSalary = user.isSalarySystem;
  const bg = isSalary ? "bg-orange-500" : "bg-blue-700";

  const titleText =
    mode === "WAGE_COMPARE"
      ? isStatutory
        ? "월 법정 통상임금 합계"
        : "월 규정 통상임금 합계"
      : "예상 지급액(세전)";

  const hourly =
    mode === "WAGE_COMPARE"
      ? Math.floor(total / hourlyWageDivisor(user))
      : 0;

  return (
    <div className={`${bg} text-white p-6 md:p-7 rounded-3xl text-center`}>
      <span className="inline-block bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold">
        {isSalary ? "연봉제" : "호봉제"}
      </span>
      <p className="text-sm opacity-80 mt-3">{titleText}</p>
      <p className="text-[36px] md:text-4xl font-extrabold tabular-nums mt-2 leading-none">
        {fNum(total)}
        <span className="text-lg opacity-80 font-bold">원</span>
      </p>

      {mode === "WAGE_COMPARE" && (
        <>
          <div className="my-4 h-px bg-white/20" />
          <p className="text-base font-bold">
            시간당 통상임금: {fNum(hourly)}원
          </p>
          <p className="text-xs opacity-80 mt-1">
            (시수 {hourlyWageDivisor(user)} 반영 완료)
          </p>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 3. 디테일 카드
// ────────────────────────────────────────────────────────────────
function DetailCard({
  user,
  mode,
  isStatutory,
}: {
  user: UserData;
  mode: ResultMode;
  isStatutory: boolean;
}) {
  const ratio = workingDaysRatio(user);
  const isSalary = user.isSalarySystem;
  const isWageCompare = mode === "WAGE_COMPARE";

  const title =
    mode === "WAGE_COMPARE"
      ? isSalary
        ? "법정 통상임금 내역 (연봉제)"
        : isStatutory
        ? "법정 통상임금 내역"
        : "규정상 통상임금 내역"
      : isSalary
      ? "연봉제 상세 내역"
      : "호봉제 상세 내역";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-6">
      <h3 className="text-[16px] md:text-[17px] font-extrabold mb-4">
        {title}
      </h3>

      <div className="space-y-1">
        {isSalary
          ? renderSalaryRows(user, mode, isStatutory, ratio)
          : renderHourlyRows(user, mode, isStatutory, ratio)}

        {/* 실적수당 (PAY_CHECK 모드 + 실적 있을 때) */}
        {mode === "PAY_CHECK" && actualPerformancePay(user) > 0 && (
          <PerformanceSection user={user} />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 호봉제 (isSalarySystem = false)
// ────────────────────────────────────────────────────────────────
function renderHourlyRows(
  user: UserData,
  mode: ResultMode,
  isStatutory: boolean,
  ratio: number
): React.ReactNode[] {
  const rows: React.ReactNode[] = [];
  const winner = bestStatutoryAllowanceType(user);
  const winnerActual = bestActualAllowanceType(user);

  if (mode === "WAGE_COMPARE") {
    // 규정/법정 통상임금
    rows.push(<DRow key="basePay" title="기본급" value={basePay(user)} />);
    rows.push(<DRow key="daewoo" title="대우수당" value={daewooPay(user)} />);
    rows.push(<DRow key="adj" title="조정수당" value={adjustmentPay(user)} />);
    rows.push(<DRow key="tech" title="기술수당" value={user.techPay} />);
    rows.push(<DRow key="techAdd" title="기술수당(가산)" value={user.techAddPay} />);
    rows.push(<DRow key="danger" title="안전역할등급별 가산금" value={user.dangerPay} />);
    rows.push(<DRow key="long" title="장기근속수당" value={longServicePay(user)} />);

    if (isStatutory) {
      // 법정 통상임금만 추가 항목들
      if (user.seniorPay > 0)
        rows.push(
          <DRow
            key="senior"
            title="업무지원수당(선임장)"
            value={user.seniorPay}
            isExcluded={winner !== "SENIOR"}
          />
        );
      if (specialTaskPayTotal(user) > 0)
        rows.push(
          <DRow
            key="special"
            title="특별업무수당 합계"
            value={specialTaskPayTotal(user)}
            isExcluded={winner !== "SPECIAL"}
          />
        );
      if (user.series === "열차승무" || user.series === "운전") {
        if (statutoryDrivePay(user) > 0)
          rows.push(
            <DRow
              key="drive"
              title="승무수당(통상)"
              value={statutoryDrivePay(user)}
              isExcluded={winner !== "DRIVE"}
            />
          );
        if (statutorySoloDrivePay(user) > 0)
          rows.push(
            <DRow
              key="solo"
              title="1인승무수당(통상)"
              value={statutorySoloDrivePay(user)}
            />
          );
      }
      rows.push(<DRow key="food" title="급식보조비" value={foodPay()} />);
      rows.push(<DRow key="bonus" title="경영평가성과급(160%)" value={bonusPay(user)} />);
      rows.push(
        <DRow
          key="trah"
          title="명절상여금(120%+608,000)"
          value={traHolidayBonusPay(user)}
        />
      );
    }
  } else {
    // PAY_CHECK (급여 명세서)
    rows.push(<DRow key="basePay" title="기본급" value={Math.round(basePay(user) * ratio)} />);
    if (user.seniorPay > 0)
      rows.push(
        <DRow
          key="senior"
          title="업무지원수당"
          value={user.seniorPay}
          isExcluded={winnerActual !== "SENIOR"}
        />
      );
    if (specialTaskPayTotal(user) > 0)
      rows.push(
        <DRow
          key="special"
          title="특별업무수당 합산"
          value={specialTaskPayTotal(user)}
          isExcluded={winnerActual !== "SPECIAL"}
        />
      );
    if (user.series === "열차승무" || user.series === "운전") {
      if (drivePay(user) > 0)
        rows.push(
          <DRow
            key="drive"
            title="승무수당"
            value={drivePay(user)}
            isExcluded={winnerActual !== "DRIVE"}
          />
        );
      if (soloDrivePay(user) > 0)
        rows.push(
          <DRow key="solo" title="1인승무수당" value={soloDrivePay(user)} />
        );
    }
    rows.push(<DRow key="food" title="급식보조비" value={Math.round(foodPay() * ratio)} />);
    rows.push(<DRow key="daewoo" title="대우수당" value={daewooPay(user)} />);
    rows.push(<DRow key="adj" title="조정수당" value={adjustmentPay(user)} />);
    rows.push(<DRow key="tech" title="기술수당" value={user.techPay} />);
    rows.push(<DRow key="techAdd" title="기술수당(가산)" value={user.techAddPay} />);
    rows.push(<DRow key="danger" title="안전역할등급별 가산금" value={user.dangerPay} />);
    rows.push(<DRow key="family" title="가족수당" value={totalFamilyPay(user)} />);
    rows.push(<DRow key="long" title="장기근속수당" value={longServicePay(user)} />);
  }

  return rows;
}

// ────────────────────────────────────────────────────────────────
// 연봉제 (isSalarySystem = true)
// ────────────────────────────────────────────────────────────────
function renderSalaryRows(
  user: UserData,
  mode: ResultMode,
  isStatutory: boolean,
  ratio: number
): React.ReactNode[] {
  const rows: React.ReactNode[] = [];
  const winner = bestStatutoryAllowanceType(user);
  const winnerActual = bestActualAllowanceType(user);
  const is34 = user.grade === 3 || user.grade === 4;

  if (mode === "WAGE_COMPARE") {
    rows.push(<DRow key="basePay" title="기준급" value={basePay(user)} />);
    if (is34) {
      rows.push(
        <DRow key="conv" title="안전역할전환금" value={safetyConversionPay(user)} />
      );
      rows.push(
        <DRow key="addPay" title="안전역할가산금" value={totalSafetyAddPay(user)} />
      );
    } else {
      rows.push(
        <DRow
          key="addPay"
          title="안전역할가산금(조정+대우)"
          value={totalSafetyAddPay(user)}
        />
      );
    }
    rows.push(<DRow key="tech" title="기술수당" value={user.techPay} />);
    rows.push(<DRow key="techAdd" title="기술수당(가산)" value={user.techAddPay} />);

    if (isStatutory) {
      rows.push(<DRow key="food" title="급식보조비" value={foodPay()} />);
      if (traHolidayBonusPay(user) > 0)
        rows.push(
          <DRow
            key="trah"
            title="명절상여금(1/12)"
            value={traHolidayBonusPay(user)}
          />
        );
      if (bonusPay(user) > 0)
        rows.push(<DRow key="bonus" title="경영평가성과급(160%)" value={bonusPay(user)} />);
      if (user.seniorPay > 0)
        rows.push(
          <DRow
            key="senior"
            title="업무지원수당(선임장)"
            value={user.seniorPay}
            isExcluded={winner !== "SENIOR"}
          />
        );
      if (specialTaskPayTotal(user) > 0)
        rows.push(
          <DRow
            key="special"
            title="특별업무수당 합계"
            value={specialTaskPayTotal(user)}
            isExcluded={winner !== "SPECIAL"}
          />
        );
      if (
        user.isSubstituteDrive &&
        (user.series === "열차승무" || user.series === "운전")
      ) {
        if (statutoryDrivePay(user) > 0)
          rows.push(
            <DRow
              key="drive"
              title="승무수당(통상)"
              value={statutoryDrivePay(user)}
              isExcluded={winner !== "DRIVE"}
            />
          );
        if (statutorySoloDrivePay(user) > 0)
          rows.push(
            <DRow
              key="solo"
              title="1인승무수당(통상)"
              value={statutorySoloDrivePay(user)}
            />
          );
      }
    }
  } else {
    // PAY_CHECK (연봉제 명세서)
    rows.push(<DRow key="basePay" title="기준급" value={Math.round(basePay(user) * ratio)} />);
    if (is34) {
      rows.push(
        <DRow
          key="conv"
          title="안전역할전환금"
          value={Math.round(safetyConversionPay(user) * ratio)}
        />
      );
      rows.push(
        <DRow
          key="addPay"
          title="안전역할가산금"
          value={Math.round(totalSafetyAddPay(user) * ratio)}
        />
      );
      if (user.dangerPay > 0)
        rows.push(<DRow key="danger" title="위험수당" value={user.dangerPay} />);
    } else {
      rows.push(
        <DRow
          key="addPay"
          title="안전역할가산금(조정+대우)"
          value={Math.round(totalSafetyAddPay(user) * ratio)}
        />
      );
      if (user.dangerPay > 0)
        rows.push(<DRow key="danger" title="위험수당" value={user.dangerPay} />);
    }
    rows.push(<DRow key="food" title="급식보조비" value={Math.round(foodPay() * ratio)} />);
    rows.push(<DRow key="family" title="가족수당" value={totalFamilyPay(user)} />);
    rows.push(<DRow key="tech" title="기술수당" value={user.techPay} />);
    rows.push(<DRow key="techAdd" title="기술수당(가산)" value={user.techAddPay} />);
    if (user.seniorPay > 0)
      rows.push(
        <DRow
          key="senior"
          title="업무지원수당"
          value={user.seniorPay}
          isExcluded={winnerActual !== "SENIOR"}
        />
      );
    if (specialTaskPayTotal(user) > 0)
      rows.push(
        <DRow
          key="special"
          title="특별업무수당 합산"
          value={specialTaskPayTotal(user)}
          isExcluded={winnerActual !== "SPECIAL"}
        />
      );
    if (
      user.isSubstituteDrive &&
      (user.series === "열차승무" || user.series === "운전")
    ) {
      if (drivePay(user) > 0)
        rows.push(
          <DRow
            key="drive"
            title="승무수당"
            value={drivePay(user)}
            isExcluded={winnerActual !== "DRIVE"}
          />
        );
      if (soloDrivePay(user) > 0)
        rows.push(
          <DRow key="solo" title="1인승무수당" value={soloDrivePay(user)} />
        );
    }
  }

  return rows;
}

// ────────────────────────────────────────────────────────────────
// 실적수당 섹션 (PAY_CHECK 모드)
// ────────────────────────────────────────────────────────────────
function PerformanceSection({ user }: { user: UserData }) {
  const regWage = regulatedHourlyWage(user);
  const statWage = statutoryHourlyWage(user);

  const items: Array<{ title: string; hours: number; multiplier: number }> = [
    { title: "시간외수당", hours: user.overtimeHours, multiplier: 1.5 },
    { title: "야간수당", hours: user.nightHours, multiplier: 0.5 },
    { title: "휴일수당1", hours: user.holiday1Hours, multiplier: 1.5 },
    { title: "휴일수당2", hours: user.holiday2Hours, multiplier: 2.0 },
  ];

  return (
    <>
      <div className="my-3 h-px bg-gray-100" />
      <p className="text-sm font-bold text-blue-700 mb-2">실적수당 상세내역</p>

      {items.map(({ title, hours, multiplier }) => {
        if (hours <= 0) return null;
        const regPay = Math.round(hours * regWage * multiplier);
        const statPay = Math.round(hours * statWage * multiplier);
        const diffPay = statPay - regPay;
        return (
          <div key={title}>
            <DRow title={title} value={regPay} />
            {diffPay > 0 && <DiffRow title={`${title}(법정차액)`} value={diffPay} />}
          </div>
        );
      })}

      {user.annualLeaveDays > 0 && (
        <DRow title="연차수당" value={annualLeavePay(user)} />
      )}

      <div className="my-2 h-px bg-gray-100" />
      <DRow title="실적수당 총액" value={actualPerformancePay(user)} isBold />
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// 디테일 행
// ────────────────────────────────────────────────────────────────
function DRow({
  title,
  value,
  isExcluded = false,
  isBold = false,
}: {
  title: string;
  value: number;
  isExcluded?: boolean;
  isBold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className={`text-[14px] md:text-[15px] ${
          isExcluded
            ? "text-red-300"
            : isBold
            ? "text-gray-900 font-bold"
            : "text-gray-600"
        }`}
      >
        {isExcluded ? `${title} [중복제외]` : title}
      </span>
      <span
        className={`text-[14px] md:text-[15px] font-bold tabular-nums ${
          isExcluded
            ? "text-red-300"
            : isBold
            ? "text-orange-500 text-base"
            : "text-gray-900"
        }`}
      >
        {isExcluded ? "0원" : `${fNum(value)}원`}
      </span>
    </div>
  );
}

function DiffRow({ title, value }: { title: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1 pl-4">
      <span className="text-[13px] text-gray-500">└ {title}</span>
      <span className="text-[13px] font-bold text-blue-700 tabular-nums">
        {fNum(value)}원
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PAY_CHECK 총합 계산 (원본 result_screen._calcActualTotalPay 그대로)
// ────────────────────────────────────────────────────────────────
function calcActualTotalPay(user: UserData): number {
  const ratio = workingDaysRatio(user);

  if (user.isSalarySystem) {
    const sum =
      basePay(user) * ratio +
      safetyConversionPay(user) * ratio +
      totalSafetyAddPay(user) * ratio +
      user.dangerPay +
      foodPay() * ratio +
      totalFamilyPay(user) +
      user.techPay +
      user.techAddPay +
      appliedSeniorPay(user) +
      appliedSpecialPay(user) +
      appliedDrivePay(user) +
      appliedSoloDrivePay(user) +
      actualPerformancePay(user);
    return Math.round(sum);
  }

  const sum =
    basePay(user) * ratio +
    appliedSeniorPay(user) +
    appliedSpecialPay(user) +
    foodPay() * ratio +
    totalFamilyPay(user) +
    adjustmentPay(user) +
    daewooPay(user) +
    user.techPay +
    user.techAddPay +
    user.dangerPay +
    longServicePay(user) +
    appliedDrivePay(user) +
    appliedSoloDrivePay(user) +
    actualPerformancePay(user);

  return Math.round(sum);
}
