"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AppUploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [requireLogin, setRequireLogin] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setIcon(selected);
      setIconPreview(URL.createObjectURL(selected));
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files);
      setScreenshots((prev) => [...prev, ...arr]);
      setScreenshotPreviews((prev) => [
        ...prev,
        ...arr.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToFirebaseDirectly = async (fileToUpload: File, folder: string) => {
    const bucket = "tristan-archive.firebasestorage.app";
    const fileName = `${Date.now()}_${fileToUpload.name}`;
    const encodedPath = encodeURIComponent(`${folder}/${fileName}`);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodedPath}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": fileToUpload.type || "application/octet-stream",
      },
      body: fileToUpload,
    });
    if (!res.ok) throw new Error("Firebase 업로드 실패");
    const data = await res.json();
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${data.downloadTokens}`;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "업로드할 앱 파일을 선택해주세요.", type: "error" });
      return;
    }
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let iconUrl = "";
      if (icon) {
        setUploadProgress("아이콘 업로드 중...");
        iconUrl = await uploadToFirebaseDirectly(icon, "icons");
      }
      const screenshotUrls: string[] = [];
      if (screenshots.length > 0) {
        for (let i = 0; i < screenshots.length; i++) {
          setUploadProgress(
            `스크린샷 업로드 중... (${i + 1}/${screenshots.length})`
          );
          const url = await uploadToFirebaseDirectly(
            screenshots[i],
            "screenshots"
          );
          screenshotUrls.push(url);
        }
      }
      setUploadProgress("앱 파일 업로드 중...");
      const fileUrl = await uploadToFirebaseDirectly(file, "apps");

      setUploadProgress("저장 중...");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          detailedDescription,
          version,
          requireLogin,
          fileUrl,
          iconUrl,
          screenshotUrls,
        }),
      });
      if (res.ok) {
        alert("앱 등록 완료!");
        router.push("/apps");
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "업로드 실패", type: "error" });
      }
    } catch {
      setMessage({ text: "업로드 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 백 네비 */}
      <div className="md:hidden flex items-center justify-between px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/apps"
          className="flex items-center gap-1 text-gray-900 -ml-2 px-2 py-1.5 active:bg-gray-100 rounded-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold">취소</span>
        </Link>
        <button
          form="upload-form"
          type="submit"
          disabled={isLoading || !file}
          className="bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition-transform"
        >
          {isLoading ? "업로드중..." : "등록"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-6 py-6 md:py-12">
        <div className="md:bg-white md:p-10 md:rounded-3xl md:border md:border-gray-100">
          <div className="hidden md:block mb-8 border-b border-gray-50 pb-5">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              관리자 · 새 앱 등록
            </h1>
            <p className="text-sm text-gray-400 font-semibold mt-1">
              아이콘과 설치 파일을 함께 업로드합니다.
            </p>
          </div>

          <div className="md:hidden mb-5">
            <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
              새 앱 등록
            </h1>
            <p className="text-sm text-gray-400 font-semibold mt-0.5">
              관리자 전용
            </p>
          </div>

          <form id="upload-form" onSubmit={handleUpload} className="space-y-5">
            {/* 아이콘 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <input
                type="file"
                className="hidden"
                id="icon-upload"
                onChange={handleIconChange}
                accept="image/*"
              />
              <label
                htmlFor="icon-upload"
                className="block w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer shrink-0"
              >
                {iconPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={iconPreview}
                    alt="Icon Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </label>
              <div>
                <p className="text-sm font-bold text-gray-900">앱 아이콘</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  클릭하여 PNG/JPG 선택
                </p>
              </div>
            </div>

            {/* 제목 + 버전 */}
            <div className="grid grid-cols-4 gap-3">
              <Field label="앱 이름" className="col-span-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 급여계산기"
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="버전" className="col-span-1">
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className={`${inputCls} text-center text-blue-600`}
                  required
                />
              </Field>
            </div>

            <Field label="한줄 설명">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="앱을 한 줄로 소개해주세요"
                className={inputCls}
                required
              />
            </Field>

            <Field label="상세 설명">
              <textarea
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="자세한 기능 설명이나 업데이트 내역"
                className={`${inputCls} h-28 resize-none leading-relaxed`}
              />
            </Field>

            {/* 스크린샷 */}
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">
                스크린샷 (여러 장)
              </label>
              <label className="flex items-center justify-center w-full h-14 bg-gray-50 rounded-2xl cursor-pointer">
                <span className="text-sm text-gray-500 font-bold">
                  + 스크린샷 추가
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleScreenshotsChange}
                  accept="image/*"
                  multiple
                />
              </label>
              {screenshotPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1 -mx-5 px-5 md:mx-0 md:px-0">
                  {screenshotPreviews.map((src, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-20 h-32 rounded-xl overflow-hidden bg-gray-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`screenshot-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 앱 파일 */}
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">
                앱 파일 (.apk / .ipa / .zip)
              </label>
              <label className="flex items-center justify-center w-full h-16 bg-gray-50 rounded-2xl cursor-pointer">
                <span className="text-sm text-gray-700 font-bold">
                  {file ? (
                    <span className="text-blue-600">{file.name}</span>
                  ) : (
                    "+ 설치 파일 선택"
                  )}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".apk,.ipa,.zip"
                />
              </label>
            </div>

            {/* STAFF ONLY 토글 */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer"
              onClick={() => setRequireLogin(!requireLogin)}
            >
              <div>
                <p className="text-sm font-bold text-gray-900">사내 전용 앱</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  STAFF 인증한 직원만 다운로드 가능
                </p>
              </div>
              <div
                className={`w-12 h-7 flex items-center rounded-full p-0.5 transition-colors ${
                  requireLogin ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full transform transition-transform ${
                    requireLogin ? "translate-x-5" : ""
                  }`}
                ></div>
              </div>
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-xl text-sm font-bold text-center ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {message.text}
              </div>
            )}
            {uploadProgress && (
              <div className="p-3 rounded-xl text-sm font-bold text-center bg-blue-50 text-blue-600">
                {uploadProgress}
              </div>
            )}

            {/* PC 버튼 */}
            <div className="hidden md:flex gap-3 pt-3">
              <Link
                href="/apps"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-center transition-all"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isLoading || !file}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {isLoading ? "업로드 중..." : "등록하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3.5 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-[15px] font-semibold placeholder:text-gray-400";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <label className="block text-[13px] font-bold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
