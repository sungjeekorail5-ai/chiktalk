"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ALL_YEARS,
  SUBJECTS_BY_MAJOR,
  getMajorsForYears,
} from "@/lib/cbt/types";

type Step = 0 | 1 | 2;

export default function CbtSelectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [years, setYears] = useState<string[]>([]);
  const [major, setMajor] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  // step1로 갈 때 직렬 후보가 줄어들면 선택값 reset
  const majorOptions = useMemo(() => getMajorsForYears(years), [years]);

  useEffect(() => {
    if (major && !majorOptions.includes(major)) {
      setMajor("");
    }
  }, [majorOptions, major]);

  const subjectOptions = useMemo(() => {
    if (!major) return [];
    return ["전체 풀기", ...(SUBJECTS_BY_MAJOR[major] ?? [])];
  }, [major]);

  const toggleYear = (y: string) => {
    setYears((prev) =>
      prev.includes(y) ? prev.filter((p) => p !== y) : [...prev, y]
    );
  };

  const handleStart = () => {
    if (years.length === 0 || !major || !subject) return;
    const params = new URLSearchParams({
      mode: "exam",
      years: years.join(","),
      major,
      subject,
    });
    router.push(`/web/cbt/quiz?${params.toString()}` as any);
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 상단 백 네비 */}
      <div className="flex items-center justify-between px-5 h-12 md:h-14 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <button
          onClick={() => {
            if (step > 0) setStep((s) => (s - 1) as Step);
            else router.push("/web/cbt");
          }}
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">뒤로</span>
        </button>
        <span className="text-xs font-extrabold text-gray-400 tracking-widest">
          {step + 1} / 3
        </span>
        <span className="w-12" />
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-md mx-auto px-5 md:px-6 py-8 md:py-12">
        {step === 0 && (
          <Wizard
            title={"도전할 기출 연도를\n모두 선택해 주세요"}
            subtitle="여러 개 선택 가능"
            options={[...ALL_YEARS]}
            multiSelect
            selectedList={years}
            onSelect={toggleYear}
            buttonLabel="다음"
            disabled={years.length === 0}
            onButton={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <Wizard
            title={"응시할 직렬을\n선택해 주세요"}
            subtitle={`선택한 연도: ${years.sort().join(", ")}`}
            options={majorOptions}
            selectedValue={major}
            onSelect={(val) => {
              setMajor(val);
              setSubject("");
              setTimeout(() => setStep(2), 200);
            }}
          />
        )}

        {step === 2 && (
          <Wizard
            title={"풀어볼 과목을\n선택해 주세요"}
            subtitle={`${major} · '전체 풀기'는 과목별 20문항씩 출제`}
            options={subjectOptions}
            selectedValue={subject}
            onSelect={(val) => setSubject(val)}
            buttonLabel="시험 시작"
            disabled={!subject}
            onButton={handleStart}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 위저드 공통 UI
// ─────────────────────────────────────────────────────────

interface WizardProps {
  title: string;
  subtitle?: string;
  options: string[];
  multiSelect?: boolean;
  selectedValue?: string;
  selectedList?: string[];
  onSelect: (val: string) => void;
  buttonLabel?: string;
  disabled?: boolean;
  onButton?: () => void;
}

function Wizard({
  title,
  subtitle,
  options,
  multiSelect,
  selectedValue,
  selectedList,
  onSelect,
  buttonLabel,
  disabled,
  onButton,
}: WizardProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl md:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight whitespace-pre-line">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 font-semibold">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {options.map((item) => {
          const isSelected = multiSelect
            ? selectedList?.includes(item) ?? false
            : selectedValue === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={`px-5 py-3 rounded-2xl font-bold text-[15px] transition-all active:scale-95 ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 active:bg-gray-200"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {buttonLabel && (
        <button
          type="button"
          onClick={onButton}
          disabled={disabled}
          className="w-full py-4 rounded-2xl font-extrabold text-white bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-[0.98]"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
