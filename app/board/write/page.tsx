"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import imageCompression from "browser-image-compression";

const ADMIN_ID = "sungjee90";

export default function WritePage() {
  const router = useRouter();

  const [category, setCategory] = useState("free");
  const [isNotice, setIsNotice] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/board/list");
        const data = await res.json();
        setCurrentUserId(data.userId || "");
      } catch (err) {
        console.error("인증 정보 로딩 실패");
      }
    }
    checkAuth();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const compressedFiles: File[] = [];
    const previewUrls: string[] = [];

    setIsLoading(true);
    const options = { maxSizeMB: 0.9, maxWidthOrHeight: 1920, useWebWorker: true };

    try {
      for (const file of files) {
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);

        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            previewUrls.push(reader.result as string);
            resolve(null);
          };
        });
      }
      setSelectedFiles(compressedFiles);
      setPreviews(previewUrls);
    } catch {
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim())
      return alert("제목과 내용을 모두 입력해주세요.");

    setIsLoading(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("isNotice", String(isNotice));
    formData.append("title", title);
    formData.append("content", content);
    selectedFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("/api/board/write", { method: "POST", body: formData });
      if (res.ok) {
        router.push("/board");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "등록 실패");
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      {/* 모바일 상단 백 네비 */}
      <div className="md:hidden flex items-center justify-between px-5 h-12 sticky top-14 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
        <Link
          href="/board"
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
          <span className="text-sm font-bold">취소</span>
        </Link>
        <button
          form="write-form"
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition-transform"
        >
          {isLoading ? "등록중..." : "등록"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-4 py-5 md:py-10 space-y-5 md:space-y-8">
        {/* PC 타이틀 */}
        <h1 className="hidden md:block text-2xl font-black text-gray-950 tracking-tight">
          글쓰기
        </h1>

        <form
          id="write-form"
          onSubmit={handleSubmit}
          className="space-y-5 md:space-y-6"
        >
          {/* 관리자 공지 체크 */}
          {currentUserId === ADMIN_ID && (
            <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={isNotice}
                onChange={(e) => setIsNotice(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-blue-700 select-none">
                중요 공지사항으로 등록 (최상단 고정)
              </span>
            </label>
          )}

          {/* 카테고리 */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-700">
              게시판 선택
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold text-[15px] appearance-none cursor-pointer transition-all"
                required
              >
                <option value="free">자유게시판</option>
                <option value="inquiry">앱 문의사항</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-700">제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold text-[15px] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-700">내용</label>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium text-[15px] leading-relaxed min-h-[280px] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 사진 첨부 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-gray-700">
                사진 첨부 (최대 5장)
              </label>
              <label
                htmlFor="file-input"
                className="bg-gray-100 text-gray-700 active:bg-gray-200 font-bold px-3.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors"
              >
                사진 선택
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {previews.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setPreviews((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-[11px] flex items-center justify-center font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-gray-400 font-medium">
              자동 압축되어 업로드됩니다.
            </p>
          </div>

          {/* PC 등록 버튼 (모바일은 상단에 있음) */}
          <button
            type="submit"
            disabled={isLoading}
            className="hidden md:block w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold py-4 rounded-2xl text-base transition-all active:scale-[0.98]"
          >
            {isLoading ? "등록 중..." : "글 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
