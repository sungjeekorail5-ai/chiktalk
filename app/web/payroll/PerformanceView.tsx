"use client";

import { useState } from "react";
import type { UserData } from "@/lib/payroll/types";
import {
  annualLeavePay,
  fNum,
  regulatedHourlyWage,
  statutoryHourlyWage,
} from "@/lib/payroll/calc";

export default function PerformanceView({
  user,
  update,
}: {
  user: UserData;
  update: (patch: Partial<UserData>) => void;
}) {
  const [isStatutory, setIsStatutory] = useState(false);

  const hourlyWage = isStatutory
    ? statutoryHourlyWage(user)
    : regulatedHourlyWage(user);

  const overtimePay = Math.round(user.overtimeHours * hourlyWage * 1.5);
  const nightPay = Math.round(user.nightHours * hourlyWage * 0.5);
  const holiday1Pay = Math.round(user.holiday1Hours * hourlyWage * 1.5);
  const holiday2Pay = Math.round(user.holiday2Hours * hourlyWage * 2.0);
  const annualPay = annualLeavePay(user);
  const total = overtimePay + nightPay + holiday1Pay + holiday2Pay + annualPay;

  return (
    <div className="px-4 md:px-5 py-4 space-y-3">
      {/* 1. 시간 변환기 */}
      <TimeConverter />

      {/* 2. 규정/법정 토글 */}
      <div className="flex gap-1 p-1 bg-gray-200 rounded-full">
        {[
          { label: "규정 시급으로 계산", val: false },
          { label: "법정 시급으로 계산", val: true },
        ].map((t) => {
          const active = isStatutory === t.val;
          return (
            <button
              key={t.label}
              onClick={() => setIsStatutory(t.val)}
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

      {/* 3. 적용 시급 표시 */}
      <div
        className={`p-5 rounded-2xl text-center transition-colors ${
          isStatutory
            ? "bg-blue-700 text-white"
            : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        <p
          className={`text-xs ${
            isStatutory ? "text-white/70" : "text-gray-500"
          }`}
        >
          {isStatutory ? "적용 통상시급 (법정 기준)" : "적용 통상시급 (규정 기준)"}
        </p>
        <p className="text-2xl font-extrabold tabular-nums mt-1.5">
          {fNum(hourlyWage)}원
        </p>
      </div>

      {/* 4. 실적 입력 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0038A8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M12 14h.01M16 14h.01M8 14h.01M12 18h.01M16 18h.01M8 18h.01" />
          </svg>
          <h3 className="text-[16px] font-extrabold text-gray-900">실적 입력</h3>
        </div>

        <DecimalRow
          label="시간외근무 (1.5배)"
          value={user.overtimeHours}
          suffix="시간"
          onChange={(v) => update({ overtimeHours: v })}
        />
        <DecimalRow
          label="야간근무 (0.5배)"
          value={user.nightHours}
          suffix="시간"
          onChange={(v) => update({ nightHours: v })}
        />
        <DecimalRow
          label="휴일근무1 (1.5배)"
          value={user.holiday1Hours}
          suffix="시간"
          onChange={(v) => update({ holiday1Hours: v })}
        />
        <DecimalRow
          label="휴일근무2 (2.0배)"
          value={user.holiday2Hours}
          suffix="시간"
          onChange={(v) => update({ holiday2Hours: v })}
        />
        <DecimalRow
          label="미사용 연차 일수"
          value={user.annualLeaveDays}
          suffix="일"
          onChange={(v) => update({ annualLeaveDays: v })}
        />
      </div>

      {/* 5. 산출 결과 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[16px] font-extrabold text-gray-900 mb-3">
          산출 결과
        </h3>
        <ResultRow title="시간외수당" value={overtimePay} />
        <ResultRow title="야간수당" value={nightPay} />
        <ResultRow title="휴일수당1" value={holiday1Pay} />
        <ResultRow title="휴일수당2" value={holiday2Pay} />
        <ResultRow title="연차수당" value={annualPay} />

        <div className="my-3 h-px bg-gray-100" />

        <div className="flex items-center justify-between">
          <span className="text-[16px] font-extrabold text-gray-900">
            총 실적수당 합계
          </span>
          <span className="text-xl font-extrabold text-orange-500 tabular-nums">
            {fNum(total)}원
          </span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 시간 변환기 (시·분 → 소수점 2자리)
// 10분 미만은 절사 (앱과 동일)
// ────────────────────────────────────────────────────────────────
function TimeConverter() {
  const [hours, setHours] = useState<number>(0);
  const [mins, setMins] = useState<number>(0);

  const dropped = Math.floor(mins / 10) * 10;
  const converted = (hours + dropped / 60).toFixed(2);

  return (
    <div className="bg-blue-50 rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-1.5 mb-1">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0038A8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <line x1="12" y1="10" x2="12" y2="10.01" />
          <line x1="16" y1="10" x2="16" y2="10.01" />
          <line x1="8" y1="10" x2="8" y2="10.01" />
          <line x1="12" y1="14" x2="12" y2="14.01" />
          <line x1="8" y1="14" x2="8" y2="14.01" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
          <line x1="8" y1="18" x2="8" y2="18.01" />
        </svg>
        <span className="text-[14px] font-extrabold text-blue-700">
          💡 시간변환기
        </span>
      </div>
      <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
        10분 미만은 절사되며, 급여 작업기준(예: 0.17, 0.33 등)으로 자동 변환됩니다.
      </p>

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          placeholder="시간"
          value={hours === 0 ? "" : hours}
          onChange={(e) => setHours(parseInt(e.target.value) || 0)}
          className="flex-1 min-w-0 text-center text-sm bg-white border border-gray-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm font-bold shrink-0">시간</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="분"
          value={mins === 0 ? "" : mins}
          onChange={(e) => setMins(parseInt(e.target.value) || 0)}
          className="flex-1 min-w-0 text-center text-sm bg-white border border-gray-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm font-bold shrink-0">분</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <div className="px-3 py-2 bg-white border-[1.5px] border-blue-700 rounded-lg shrink-0 min-w-[64px] text-center">
          <span className="text-sm font-extrabold text-orange-500 tabular-nums">
            {converted}
          </span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 입력 행 / 결과 행
// ────────────────────────────────────────────────────────────────
function DecimalRow({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[14px] text-gray-800 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 text-center text-sm border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 w-8">{suffix}</span>
      </div>
    </div>
  );
}

function ResultRow({ title, value }: { title: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[14px] text-gray-700">{title}</span>
      <span className="text-sm font-bold tabular-nums text-gray-900">
        {fNum(value)}원
      </span>
    </div>
  );
}
