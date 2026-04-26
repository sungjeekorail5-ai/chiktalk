"use client";

import { useState } from "react";

type DialogKind = "rules" | "notice" | "faq" | null;

export default function EtcView() {
  const [open, setOpen] = useState<DialogKind>(null);

  return (
    <div className="px-4 md:px-5 py-4 space-y-3">
      {/* 메뉴 카드들 */}
      <MenuTile
        title="보수 규정 상세 보기"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        }
        onClick={() => setOpen("rules")}
      />
      <MenuTile
        title="공지사항"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        }
        onClick={() => setOpen("notice")}
      />
      <MenuTile
        title="자주 묻는 질문 (FAQ)"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0038A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
        onClick={() => setOpen("faq")}
      />

      {/* 푸터 — 버전 + 이메일 */}
      <div className="text-center pt-10 pb-4 space-y-1.5">
        <p className="text-xs font-bold text-gray-400 tracking-wider">
          alpha ver. 1.05
        </p>
        <p className="text-xs text-gray-400">앱 관련 문의 및 피드백</p>
        <p className="text-base font-bold text-blue-700">
          sungjee90@naver.com
        </p>
      </div>

      {/* 모달들 */}
      {open === "rules" && <RulesDialog onClose={() => setOpen(null)} />}
      {open === "notice" && <NoticeDialog onClose={() => setOpen(null)} />}
      {open === "faq" && <FaqDialog onClose={() => setOpen(null)} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 메뉴 타일
// ────────────────────────────────────────────────────────────────
function MenuTile({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 active:bg-gray-50 transition-colors"
    >
      {icon}
      <span className="flex-1 text-left text-[15px] font-bold text-gray-800">
        {title}
      </span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// 모달 컨테이너
// ────────────────────────────────────────────────────────────────
function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-extrabold text-blue-700">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full active:bg-gray-100 flex items-center justify-center"
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
              className="text-gray-500"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 1. 보수 규정 상세 (특별업무수당 비고)
// ────────────────────────────────────────────────────────────────
function RulesDialog({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="보수 규정 상세 보기" onClose={onClose}>
      <h4 className="text-base font-extrabold text-gray-900 mb-3">
        〈비고〉 — 특별업무수당
      </h4>
      <div className="space-y-3 text-[13px] leading-relaxed text-gray-800">
        <p>
          1. 제1호 역무원중 '수송담당'이라함은 영업·차량분야에서 주업무가 입환작업
          (동력차 운전을 위한 전호현시, 열차조성등을 위한 연결기·공기호스 취급업무를
          말한다) 및 기타 열차운전·구내작업에 부대되는 업무를 담당하는 자를 말한다.
        </p>
        <div>
          <p>2. 제2호 중 '법률에 의한 담당업무지정자'란 다음 각호의 자를 말한다.</p>
          <p className="pl-3 mt-1">
            가. '안전관리자'라 함은「산업안전보건법」제17조(안전관리자)에 의거 안전관리자로 선임된 관련업무 수행자
          </p>
          <p className="pl-3">
            나. '보건관리자'라 함은「산업안전보건법」제18조(보건관리자)에 의거 보건관리자로 선임된 관련업무 수행자
          </p>
          <p className="pl-3">
            다. '안전보건담당자'라 함은「산업안전보건법 시행령」제24조에 의거
            산업안전보건관리담당자로 선임된 자 중 법률에서 정하는 자격을 취득하고 관련 업무를 수행하는 자
          </p>
          <p className="pl-3">
            라. '전기안전관리자' 및 '전기안전보조자'라 함은「전기안전관리법」제22조에 의거
            전기안전관리자 또는 전기안전보조자로 지정된 관련업무 수행자
          </p>
          <p className="pl-3">
            마. '위험물관리자'라 함은「위험물안전관리법」제15조에 의거 위험물관리자로 지정된 관련업무 수행자
          </p>
          <p className="pl-3">
            바. '무선종사자'라 함은「전파법」제71조에 의거 무선종사자로 지정된 관련업무 수행자
          </p>
          <p className="pl-3">
            사. '고압(도시·액화석유)가스관리자'라 함은「고압가스안전관리법」제15조 또는
            「도시가스사업법」제29조 또는「액화석유가스의 안전관리 및 사업법」제34조에 의거
            가스안전관리자로 지정된 관련업무 수행자
          </p>
        </div>
        <p>
          3. 제3호 '전기분야 전철보수장비 운전업무 겸직자'라 함은 관련 자격증을 소지하고
          월중에 전차선로 작업을 위해 운전명령을 받아 전철보수장비 운전실적이 있는 자
          (장비운전원 제외)를 말한다.
        </p>
        <p>
          4. 제4호 '시설분야 직원 중 장비(모터카) 운전업무 겸직자'라 함은 관련 자격증을 소지하고
          월 중에 선로보수작업을 위해 운전명령을 받아 장비(모터카) 운전 실적이 있는 자
          (단, 장비운영사업소 및 장비팀 직원 제외)를 말한다.
        </p>
        <p>
          5. 제5호 '수송담당 직원 중 무선제어 입환업무 겸직자'라 함은 관련 자격을 갖추고
          월 중에 입환작업 계획에 따라 무선제어 입환실적이 있는 자를 말한다.
        </p>
      </div>
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────────
// 2. 공지사항 (버전별 노트)
// ────────────────────────────────────────────────────────────────
function NoticeDialog({ onClose }: { onClose: () => void }) {
  const items = [
    {
      ver: "1.05 (web 이식)",
      date: "2026.04.26.",
      body:
        "칙칙톡톡 웹에 이식 (iOS 사용자 대응)\n장기근속수당 longServiceBaseDate 사용 픽스\n일할계산 분모를 그 달 일수로 픽스",
      web: true,
    },
    {
      ver: "1.04",
      date: "2026.03.22.",
      body: "일부 버그 수정\n연봉제 일부 도입",
    },
    {
      ver: "1.03",
      date: "2026.03.21.",
      body:
        "UI 일부 변경(스텝퍼)\n장기근속 가산 입력 탭 생성\n특별업무수당 추가\n수당 중복지급 방지(특별,업무,승무)",
    },
    {
      ver: "1.02",
      date: "2026.03.20.",
      body:
        "실적수당 구현\n급식비 수정\n업무지원수당 추가\n주행 키로수 소수점 2자리 제한",
    },
    {
      ver: "1.01",
      date: "2026.03.19.",
      body:
        "승무 및 1인승무수당 반영\n법정 통상임금 표출(일부수당 미작업)\n통상임금 시수 반영\n위험수당 명칭 변경",
    },
    {
      ver: "초기 테스트",
      date: "2026.03.19.",
      body:
        "완전 초기 개발 단계입니다.\n간단한 테스트를 위해 배포했습니다.\n현재 구현 기능 중, 오류 사항 있으면 알려주세요.",
    },
  ];

  return (
    <ModalShell title="공지사항" onClose={onClose}>
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.ver}
            className="bg-white border border-gray-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h4 className="text-[15px] font-extrabold text-blue-700">
                🚀 {it.ver} 배포
              </h4>
              {it.web && (
                <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none">
                  WEB
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mb-2">
              ({it.date})
            </p>
            <p className="text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap">
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────────
// 3. FAQ (앱은 placeholder, 웹도 동일)
// ────────────────────────────────────────────────────────────────
function FaqDialog({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="자주 묻는 질문 (FAQ)" onClose={onClose}>
      <div className="text-center py-12 space-y-3">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto"
        >
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
        </svg>
        <p className="text-base font-extrabold text-gray-700">
          현재 준비 중입니다
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          자주 묻는 질문 모음을 곧 추가할 예정이에요.
          <br />
          궁금한 점이 있으면 메일로 문의해 주세요.
        </p>
      </div>
    </ModalShell>
  );
}
