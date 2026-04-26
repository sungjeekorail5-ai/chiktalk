"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createDefaultUserData, type UserData } from "@/lib/payroll/types";
import InputWizard from "./InputWizard";

const STORAGE_KEY = "payroll:userData";

type Tab = 0 | 1 | 2 | 3 | 4;

const TABS: Array<{ icon: React.ReactNode; label: string }> = [
  {
    label: "정보입력",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
      </svg>
    ),
  },
  {
    label: "통상임금",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "실적입력",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "급여조회",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "기타",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
];

export default function PayrollPage() {
  const [tab, setTab] = useState<Tab>(0);
  const [userData, setUserData] = useState<UserData>(() =>
    createDefaultUserData()
  );
  const [loaded, setLoaded] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  // localStorage 불러오기 + 첫 진입 시 공지
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserData({ ...createDefaultUserData(), ...parsed });
      }
      const seen = sessionStorage.getItem("payroll:noticeSeen");
      if (!seen) setShowNotice(true);
    } catch {}
    setLoaded(true);
  }, []);

  // 변경 시 자동 저장
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch {}
  }, [userData, loaded]);

  const updateUser = (patch: Partial<UserData>) =>
    setUserData((prev) => ({ ...prev, ...patch }));

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* 상단 백 + 공지 */}
      <div className="flex items-center justify-between px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/web"
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
          <span className="text-sm font-bold">Web 앱</span>
        </Link>
        <p className="text-xs font-extrabold text-gray-400 tracking-widest">
          KORAIL PAYROLL
        </p>
        <span className="w-12" />
      </div>

      {/* 탭바 (앱과 동일: 상단 5탭) */}
      <div className="bg-white px-3 md:px-5 pt-3 pb-2 sticky top-[88px] z-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-1">
          {TABS.map((t, i) => {
            const active = tab === i;
            return (
              <button
                key={t.label}
                onClick={() => setTab(i as Tab)}
                className="flex flex-col items-center gap-1 flex-1 py-1.5 active:scale-95 transition-transform"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 border-[1.5px] border-blue-200"
                      : "bg-gray-50 text-gray-400 border-[1.5px] border-transparent"
                  }`}
                >
                  {t.icon}
                </div>
                <span
                  className={`text-[11px] tracking-tight ${
                    active
                      ? "text-gray-900 font-extrabold"
                      : "text-gray-500 font-bold"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-3xl mx-auto">
        {tab === 0 && (
          <InputWizard
            user={userData}
            update={updateUser}
            onFinish={() => setTab(1)}
          />
        )}
        {tab !== 0 && <Placeholder phase={tab} />}
      </div>

      {/* 공지 모달 (첫 진입 시 1회) */}
      {showNotice && (
        <NoticeDialog
          onClose={() => {
            sessionStorage.setItem("payroll:noticeSeen", "1");
            setShowNotice(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 미구현 탭 placeholder (P3·P4·P5에서 채움)
// ─────────────────────────────────────────────────────
function Placeholder({ phase }: { phase: number }) {
  const labels: Record<number, string> = {
    1: "통상임금 — P3에서 구현",
    2: "실적입력 — P4에서 구현",
    3: "급여조회 — P3에서 구현",
    4: "기타 — P5에서 구현",
  };
  return (
    <div className="px-5 py-16 text-center space-y-2">
      <div className="text-4xl">🚧</div>
      <p className="text-base font-extrabold text-gray-900">
        {labels[phase] ?? ""}
      </p>
      <p className="text-xs text-gray-500">
        다음 단계에서 구현될 예정이에요.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 공지 다이얼로그 (앱과 동일 — 비공식 안내)
// ─────────────────────────────────────────────────────
function NoticeDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h3 className="text-lg font-extrabold text-blue-700">공지사항</h3>
        </div>
        <div className="space-y-3 text-[14px] leading-relaxed">
          <p>
            <span className="font-bold w-5 inline-block">1.</span>
            본 앱은 <span className="font-extrabold text-red-500">비공식 앱</span>으로,{" "}
            <span className="font-extrabold text-red-500">회사와 아무런 관련이 없습니다.</span>
          </p>
          <p>
            <span className="font-bold w-5 inline-block">2.</span>
            직원들을 보조하기 위해 '개인'이 만든 앱일 뿐입니다.
          </p>
          <p>
            <span className="font-bold w-5 inline-block">3.</span>
            해당 앱을 근거로,{" "}
            <span className="font-extrabold text-red-500">
              급여 담당자들에 대한 문의는 절대 하지마세요.
            </span>
          </p>
          <p>
            <span className="font-bold w-5 inline-block">4.</span>
            사용 중 개선이 필요한 사항은 메일로 알려주세요.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-blue-700 text-white font-extrabold rounded-xl"
        >
          위 내용을 확인했습니다
        </button>
      </div>
    </div>
  );
}
