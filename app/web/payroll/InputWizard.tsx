"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DRIVE_ROLES_BY_TRAIN,
  SPECIAL_TASK_LABELS,
  getDeptOptionsByGrade,
  type DeptCategory,
  type Grade,
  type JobRoleGrade,
  type SafetyRoleGrade,
  type SeriesType,
  type TrainCategory,
  type UserData,
  type WorkType,
} from "@/lib/payroll/types";
import {
  fNum,
  getDaysInMonth,
  specialTaskPayTotal,
} from "@/lib/payroll/calc";

// ────────────────────────────────────────────────────────────────
// 메인 InputWizard
// ────────────────────────────────────────────────────────────────
export default function InputWizard({
  user,
  update,
  onFinish,
}: {
  user: UserData;
  update: (patch: Partial<UserData>) => void;
  onFinish: () => void;
}) {
  const [step, setStep] = useState(0);

  // 직렬=승무/운전 OR (연봉제+대체승무) 일 때 4단계, 그 외는 3단계
  const isDrive =
    user.series === "열차승무" ||
    user.series === "운전" ||
    (user.isSalarySystem && user.isSubstituteDrive);
  const totalSteps = isDrive ? 4 : 3;

  // step 범위 보호 (직렬 변경 시 totalSteps 줄어들면 step 조정)
  useEffect(() => {
    if (step >= totalSteps) setStep(totalSteps - 1);
  }, [step, totalSteps]);

  const stepTitles = isDrive
    ? ["기본 정보 입력", "가족 / 장기근속", "승무 실적 입력", "기타 수당 선택"]
    : ["기본 정보 입력", "가족 / 장기근속", "기타 수당 선택"];

  return (
    <div className="px-4 md:px-5 pt-4 pb-32">
      {/* 진행 헤더 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[12px] font-extrabold text-orange-500 tracking-wide">
            Step {step + 1} / {totalSteps}
          </span>
          <span className="text-sm font-bold text-gray-900">
            {stepTitles[step]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-blue-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 단계별 본문 */}
      {step === 0 && <Step1 user={user} update={update} />}
      {step === 1 && <Step2 user={user} update={update} />}
      {step === 2 && isDrive && <Step3Drive user={user} update={update} />}
      {step === 2 && !isDrive && <Step4Extra user={user} update={update} />}
      {step === 3 && isDrive && <Step4Extra user={user} update={update} />}

      {/* 하단 이전/다음 버튼 (fixed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-base font-bold text-gray-500 px-4 py-2"
            >
              이전
            </button>
          ) : (
            <span className="w-16" />
          )}
          <button
            onClick={() => {
              if (step < totalSteps - 1) setStep((s) => s + 1);
              else onFinish();
            }}
            className={`px-8 py-3 rounded-xl font-extrabold text-white transition-colors ${
              step < totalSteps - 1
                ? "bg-blue-700 active:bg-blue-800"
                : "bg-orange-500 active:bg-orange-600"
            }`}
          >
            {step < totalSteps - 1 ? "다음 단계" : "입력 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Step 1 — 기본 정보
// ────────────────────────────────────────────────────────────────
function Step1({
  user,
  update,
}: {
  user: UserData;
  update: (p: Partial<UserData>) => void;
}) {
  const calcDate = new Date(user.calculationMonth);
  const maxDays = getDaysInMonth(calcDate.getFullYear(), calcDate.getMonth() + 1);

  const isSalary = user.isSalarySystem;
  const is34 = user.grade === 3 || user.grade === 4;

  return (
    <CardSection
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      }
      title="기본 정보"
    >
      {/* 보수 체계 */}
      <Row label="보수 체계">
        <SystemToggle
          isSalary={isSalary}
          onChange={(v) =>
            update({
              isSalarySystem: v,
              ...(v ? {} : { isSubstituteDrive: false }),
            })
          }
        />
      </Row>

      {isSalary && (
        <>
          <Divider />
          <Row label="대체승무 여부" labelClass="text-orange-500 font-bold">
            <Switch
              value={user.isSubstituteDrive}
              onChange={(v) => update({ isSubstituteDrive: v })}
              colorOn="bg-orange-500"
            />
          </Row>
        </>
      )}

      <Divider />

      <Dropdown<SeriesType>
        label="직렬"
        value={user.series}
        options={[
          "사무영업",
          "열차승무",
          "운전",
          "차량",
          "토목",
          "건축",
          "전기통신",
        ]}
        onChange={(v) => update({ series: v })}
      />
      <Dropdown<WorkType>
        label="근무형태_시수"
        value={user.workType}
        options={[
          "통상일근_209",
          "3조2교대_216",
          "4조2교대(기본형)_216",
          "4조2교대(야간형)_212",
          "야간격일제_187",
          "교번_242",
        ]}
        onChange={(v) => update({ workType: v })}
      />
      <Dropdown<Grade>
        label="급수"
        value={user.grade}
        options={[1, 2, 3, 4, 5, 6] as Grade[]}
        labels={{
          1: "1급(미구현)",
          2: "2급(미구현)",
          3: "3급",
          4: "4급",
          5: "5급",
          6: "6급",
        }}
        onChange={(v) => update({ grade: v, deptCategory: "해당없음" })}
      />

      {/* 본인 기준급 (연봉제+3·4급) */}
      {isSalary && is34 && (
        <IntegerInput
          label="본인 기준급 입력"
          value={user.basePayInput}
          suffix="원"
          onChange={(v) => update({ basePayInput: v })}
        />
      )}

      {/* 호봉 (호봉제 or 연봉제 5·6급) */}
      {(!isSalary || (isSalary && user.grade >= 5)) && (
        <Dropdown<number>
          label="호봉"
          value={user.step}
          options={Array.from({ length: 35 }, (_, i) => i + 1)}
          onChange={(v) => update({ step: v })}
        />
      )}

      {/* 안전역할 3종 (연봉제+3·4급) */}
      {isSalary && is34 && (
        <>
          <Divider />
          <p className="text-[15px] font-bold text-blue-700 mb-2">
            🛡️ 연봉제 안전역할급 정보
          </p>
          <Dropdown<SafetyRoleGrade>
            label="안전역할등급"
            value={user.safetyRoleGrade}
            options={[
              "해당없음",
              "G-S1",
              "G-S2",
              "G-S3",
              "G-S4",
              "G-S5",
              "G-S6-1",
              "G-S6-2",
              "G-S7",
              "G-S8",
              "G-S9",
              "G-S10",
              "G-S11",
              "G-S12",
              "G-S13",
            ]}
            onChange={(v) => update({ safetyRoleGrade: v })}
          />
          <Dropdown<DeptCategory>
            label="소속분류"
            value={user.deptCategory}
            options={getDeptOptionsByGrade(user.grade)}
            onChange={(v) => update({ deptCategory: v })}
          />
          <Dropdown<JobRoleGrade>
            label="직무평가등급"
            value={user.jobRoleGrade}
            options={["해당없음", "S", "A", "B", "C", "D"]}
            onChange={(v) => update({ jobRoleGrade: v })}
          />
        </>
      )}

      <Divider />
      <DateRow
        label="입사일"
        value={user.hireDate}
        onChange={(d) => update({ hireDate: d })}
      />
      <DateRow
        label="현직급 승진일"
        value={user.promotionDate}
        onChange={(d) => update({ promotionDate: d })}
      />
      <NumStepper
        label="근무일수(급여 조회월)"
        value={user.workingDays}
        max={maxDays}
        onChange={(v) => update({ workingDays: v })}
      />
    </CardSection>
  );
}

// ────────────────────────────────────────────────────────────────
// Step 2 — 가족 / 장기근속
// ────────────────────────────────────────────────────────────────
function Step2({
  user,
  update,
}: {
  user: UserData;
  update: (p: Partial<UserData>) => void;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <CardSection
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        }
        title="장기근속 정보"
      >
        <DateRow
          label="장기근속 조회일"
          value={user.longServiceBaseDate}
          onChange={(d) => update({ longServiceBaseDate: d })}
        />
        <IntegerInput
          label="가산 경력 (장기근속)"
          value={user.addServiceMonths}
          suffix="개월"
          onChange={(v) => update({ addServiceMonths: v })}
          onInfoTap={() => setShowInfo(true)}
        />
      </CardSection>

      <CardSection
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        }
        title="가족 수당 대상"
      >
        <NumStepper
          label="배우자"
          value={user.spouseCount}
          max={1}
          onChange={(v) => {
            const newOther =
              user.spouseCount + user.otherFamilyCount > 4
                ? Math.max(0, 4 - v)
                : user.otherFamilyCount;
            update({ spouseCount: v, otherFamilyCount: newOther });
          }}
        />
        <NumStepper
          label="부양 자녀 수"
          value={user.childCount}
          max={10}
          onChange={(v) => update({ childCount: v })}
        />
        <NumStepper
          label="기타 부양가족"
          value={user.otherFamilyCount}
          max={Math.max(0, 4 - user.spouseCount)}
          onChange={(v) => update({ otherFamilyCount: v })}
        />
      </CardSection>

      {showInfo && <AddServiceInfoDialog onClose={() => setShowInfo(false)} />}
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// Step 3 — 승무 실적 (조건부)
// ────────────────────────────────────────────────────────────────
function Step3Drive({
  user,
  update,
}: {
  user: UserData;
  update: (p: Partial<UserData>) => void;
}) {
  const calcDate = new Date(user.calculationMonth);
  const maxDays = getDaysInMonth(calcDate.getFullYear(), calcDate.getMonth() + 1);

  // km 기반 직책 여부
  const isKmBased =
    (user.trainCategory === "고속열차" &&
      (user.driveRole === "KTX기장" ||
        user.driveRole === "지원기장" ||
        user.driveRole.includes("열차팀장"))) ||
    user.driveRole.includes("여객전무");

  const hireYear = new Date(user.hireDate).getFullYear();

  return (
    <CardSection
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="14" rx="3" />
          <path d="M8 21l-2-4M16 21l2-4" />
          <circle cx="9" cy="14" r="0.8" fill="currentColor" />
          <circle cx="15" cy="14" r="0.8" fill="currentColor" />
        </svg>
      }
      title="승무 실적 입력"
    >
      <Row label="1인승무 전담소속(통상임금 용도)" labelClass="font-bold">
        <Switch
          value={user.isDedicatedSoloDept}
          onChange={(v) => update({ isDedicatedSoloDept: v })}
          colorOn="bg-blue-700"
        />
      </Row>
      <Divider />

      <Dropdown<TrainCategory>
        label="차종"
        value={user.trainCategory}
        options={["고속열차", "일반열차", "수도권전동열차", "특별동차"]}
        onChange={(v) =>
          update({
            trainCategory: v,
            driveRole: DRIVE_ROLES_BY_TRAIN[v][0],
          })
        }
      />
      <Dropdown<string>
        label="직책"
        value={user.driveRole}
        options={DRIVE_ROLES_BY_TRAIN[user.trainCategory]}
        onChange={(v) => update({ driveRole: v })}
      />
      <NumStepper
        label="실 승무일수"
        value={user.drivingDays}
        max={maxDays}
        onChange={(v) => update({ drivingDays: v })}
      />

      {isKmBased && (
        <>
          <DecimalInput
            label="당월 주행거리(km)"
            value={user.drivingKm}
            suffix="km"
            onChange={(v) => update({ drivingKm: v })}
          />
          <DecimalInput
            label="계획 주행거리(km) [통상]"
            value={user.plannedDrivingKm}
            suffix="km"
            onChange={(v) => update({ plannedDrivingKm: v })}
          />
        </>
      )}

      {user.driveRole.includes("여객전무") && (
        <NumStepper
          label="객차 량수"
          value={user.passengerCars}
          max={20}
          onChange={(v) => update({ passengerCars: v })}
        />
      )}

      {hireYear >= 2014 && (
        <Row label="미탑승 열차 1인승무">
          <Switch
            value={user.isSoloWithoutCrew}
            onChange={(v) => update({ isSoloWithoutCrew: v })}
            colorOn="bg-orange-500"
          />
        </Row>
      )}
    </CardSection>
  );
}

// ────────────────────────────────────────────────────────────────
// Step 4 — 기타 수당
// ────────────────────────────────────────────────────────────────
function Step4Extra({
  user,
  update,
}: {
  user: UserData;
  update: (p: Partial<UserData>) => void;
}) {
  const [showSpecialPicker, setShowSpecialPicker] = useState(false);
  const [showSpecialInfo, setShowSpecialInfo] = useState(false);
  const isSalary = user.isSalarySystem;
  const showDangerInput = !isSalary || (isSalary && user.isSubstituteDrive);

  return (
    <>
      <CardSection
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        }
        title="업무지원 수당"
      >
        <Dropdown<number>
          label="업무지원수당"
          value={user.seniorPay}
          options={[70000, 0]}
          labels={{ 70000: "선임장/직무대리 등(7만)", 0: "해당없음" }}
          onChange={(v) => update({ seniorPay: v })}
        />
      </CardSection>

      <CardSection
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M14.31 8l5.74 9.94" />
            <path d="M9.69 8h11.48" />
            <path d="M7.38 12l5.74-9.94" />
            <path d="M9.69 16L3.95 6.06" />
            <path d="M14.31 16H2.83" />
            <path d="M16.62 12l-5.74 9.94" />
          </svg>
        }
        title="기타 수당"
      >
        {isSalary && (
          <>
            <IntegerInput
              label="명절상여금 입력"
              value={user.holidayBonusInput}
              suffix="원"
              onChange={(v) => update({ holidayBonusInput: v })}
            />
            <Divider />
          </>
        )}
        <Dropdown<number>
          label="기술수당"
          value={user.techPay}
          options={[80000, 60000, 40000, 30000, 20000, 0]}
          labels={{
            80000: "기술사(8만)",
            60000: "기능장(6만)",
            40000: "기사(4만)",
            30000: "산업기사(3만)",
            20000: "기능사(2만)",
            0: "없음",
          }}
          onChange={(v) => update({ techPay: v })}
        />
        <Dropdown<number>
          label="기술수당(가산)"
          value={user.techAddPay}
          options={[10000, 0]}
          labels={{ 10000: "1만", 0: "없음" }}
          onChange={(v) => update({ techAddPay: v })}
        />

        {showDangerInput && (
          <Dropdown<number>
            label={isSalary ? "위험수당" : "안전역할등급 가산금"}
            value={user.dangerPay}
            options={[50000, 20000, 0]}
            labels={
              isSalary
                ? { 50000: "위험수당 갑(5만)", 20000: "위험수당 을(2만)", 0: "없음(0)" }
                : { 50000: "S11(5만/갑)", 20000: "S12(2만/을)", 0: "S13(0)" }
            }
            onChange={(v) => update({ dangerPay: v })}
          />
        )}

        {/* 특별업무수당 — BottomSheet 진입 */}
        <button
          onClick={() => setShowSpecialPicker(true)}
          className="flex items-center justify-between w-full py-3 active:bg-gray-50 rounded-lg -mx-2 px-2 transition-colors"
        >
          <span className="flex items-center gap-1 text-base text-gray-800">
            특별업무수당 선택
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowSpecialInfo(true);
              }}
              className="p-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg">
            <span className="text-sm font-bold">
              {fNum(specialTaskPayTotal(user))}원
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </CardSection>

      {showSpecialPicker && (
        <SpecialTaskPicker
          selected={user.selectedSpecialTasks}
          onChange={(arr) => update({ selectedSpecialTasks: arr })}
          onClose={() => setShowSpecialPicker(false)}
        />
      )}
      {showSpecialInfo && (
        <SpecialTaskInfoDialog onClose={() => setShowSpecialInfo(false)} />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// 공통 UI 위젯들
// ────────────────────────────────────────────────────────────────
function CardSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[16px] font-extrabold text-gray-900">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  label,
  labelClass,
  children,
}: {
  label: string;
  labelClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-[15px] text-gray-800 ${labelClass ?? ""}`}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 my-3" />;
}

function SystemToggle({
  isSalary,
  onChange,
}: {
  isSalary: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm ${
          !isSalary ? "text-blue-700 font-extrabold" : "text-gray-400"
        }`}
      >
        호봉제
      </span>
      <Switch
        value={isSalary}
        onChange={onChange}
        colorOn="bg-orange-500"
      />
      <span
        className={`text-sm ${
          isSalary ? "text-orange-500 font-extrabold" : "text-gray-400"
        }`}
      >
        연봉제
      </span>
    </div>
  );
}

function Switch({
  value,
  onChange,
  colorOn,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  colorOn: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        value ? colorOn : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
          value ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  labels,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  labels?: Partial<Record<T, string>>;
}) {
  const safeValue = options.includes(value) ? value : options[0];
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[15px] text-gray-800 flex-1 min-w-0">{label}</span>
      <select
        value={String(safeValue)}
        onChange={(e) => {
          const v =
            typeof options[0] === "number"
              ? (Number(e.target.value) as T)
              : (e.target.value as T);
          onChange(v);
        }}
        className="text-right text-[14px] font-bold bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 max-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {labels?.[o] ?? String(o)}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (d: string) => void;
}) {
  // YYYY-MM-DD 부분만
  const dateStr = useMemo(() => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [value]);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[15px] text-gray-800">{label}</span>
      <input
        type="date"
        value={dateStr}
        onChange={(e) => {
          if (!e.target.value) return;
          const newDate = new Date(e.target.value);
          onChange(newDate.toISOString());
        }}
        className="text-[15px] font-bold text-blue-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function IntegerInput({
  label,
  value,
  suffix,
  onChange,
  onInfoTap,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (v: number) => void;
  onInfoTap?: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[15px] text-gray-800 flex-1 flex items-center gap-1">
        {label}
        {onInfoTap && (
          <button onClick={onInfoTap} className="p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        )}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-24 text-center text-[15px] border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 w-8">{suffix}</span>
      </div>
    </div>
  );
}

function DecimalInput({
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
    <div className="flex items-center justify-between py-2">
      <span className="text-[15px] text-gray-800">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 text-center text-[15px] border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 w-8">{suffix}</span>
      </div>
    </div>
  );
}

function NumStepper({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[15px] text-gray-800 flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-100 text-gray-400"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="w-8 text-center font-extrabold text-[17px]">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-100 text-orange-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 모달들
// ────────────────────────────────────────────────────────────────
function lockBody() {
  document.body.style.overflow = "hidden";
}
function unlockBody() {
  document.body.style.overflow = "";
}

function AddServiceInfoDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    lockBody();
    return unlockBody;
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M9 18l-3 4M15 18l3 4" />
          </svg>
          <h3 className="text-lg font-extrabold text-blue-700">
            가산 경력 (장기근속수당) 안내
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-800">
          보수규정 제23조 2항에 따라 장기근속수당 산정 시 아래의 경력이 근속연수에 합산됩니다.
          {"\n\n"}
          1. 병역법에 의한 군 복무기간{"\n"}
          2. 국가 및 지방자치단체 공무원 경력{"\n"}
          3. 기타 인정되는 대행 기관 경력{"\n\n"}
          해당되는 총 개월 수를 환산하여 직접 입력해 주세요.{"\n"}
          (예: 2년 군복무 ➔ 24개월 입력)
        </p>
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-blue-700 text-white font-extrabold rounded-xl"
        >
          확인
        </button>
      </div>
    </div>
  );
}

function SpecialTaskPicker({
  selected,
  onChange,
  onClose,
}: {
  selected: number[];
  onChange: (arr: number[]) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<number[]>([...selected]);
  useEffect(() => {
    lockBody();
    return unlockBody;
  }, []);

  const total = local.reduce((s, v) => s + v, 0);
  const cap = total > 200000 ? 200000 : total;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] max-h-[85vh] overflow-y-auto"
      >
        <h3 className="text-lg font-extrabold text-blue-700 mb-1">
          특별업무수당 다중 선택
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          중복 체크 시 합산되며, 월 최대 20만원까지만 인정됩니다.
        </p>
        <div className="space-y-1">
          {Object.entries(SPECIAL_TASK_LABELS).map(([priceStr, label]) => {
            const price = Number(priceStr);
            const checked = local.includes(price);
            return (
              <label
                key={price}
                className="flex items-center gap-3 py-2.5 active:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setLocal((prev) =>
                      checked ? prev.filter((v) => v !== price) : [...prev, price]
                    )
                  }
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-[14px] text-gray-800 flex-1">{label}</span>
              </label>
            );
          })}
        </div>
        <button
          onClick={() => {
            onChange(local);
            onClose();
          }}
          className="w-full mt-4 py-3.5 bg-blue-700 text-white font-extrabold rounded-xl"
        >
          합산 적용하기 ({fNum(cap)}원)
        </button>
      </div>
    </div>
  );
}

function SpecialTaskInfoDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    lockBody();
    return unlockBody;
  }, []);

  const items = [
    ["1. 안전관리자(겸임포함), 보건관리자(겸임포함)", "100,000원"],
    ["2. 전철보수 장비 운전업무 겸직자(전기분야)", "90,000원"],
    ["3. 무선제어 입환업무 겸직자(수송담당)", "85,000원"],
    ["4. 안전보건담당자, 전기안전관리자", "70,000원"],
    ["5. 장비(모터카) 운전업무 겸직자(시설분야)", "50,000원"],
    ["6. 역무원 중 수송담당, 역무운용원 중 입환담당", "50,000원"],
    ["7. 차량관리원(입환 등 열차조성업무 담당)", "50,000원"],
    [
      "8. (선임)시설관리장, 시설관리원, 시설관리사, 선임기계관리장",
      "35,000원",
    ],
    ["  └ 통상일근자", "55,000원"],
    ["9. (선임)전기장, 전기원 ,전기관리사", "35,000원"],
    ["10. (선임)차량관리장, 차량관리원, 차량관리사, 장비관리장", "35,000원"],
    ["11. 장비관리원, (선임)전기장_차량, 전기원_차량", "35,000원"],
    [
      "12. 위험물관리자, 고압가스관리자, 무선국무선종사자, 전기안전보조자",
      "35,000원",
    ],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] max-h-[85vh] overflow-y-auto"
      >
        <h3 className="text-lg font-extrabold text-blue-700 mb-3">
          특별업무수당 안내
        </h3>
        <div className="space-y-2">
          {items.map(([desc, amount], i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] leading-relaxed">
              <span className="flex-1 text-gray-800">{desc}</span>
              <span className="text-orange-600 font-bold whitespace-nowrap">
                {amount}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-blue-700 text-white font-extrabold rounded-xl"
        >
          확인
        </button>
      </div>
    </div>
  );
}
