"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditClient({ appId, initialData }: { appId: string, initialData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // 텍스트 필드
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [detailedDescription, setDetailedDescription] = useState(initialData.detailedDescription || "");
  const [version, setVersion] = useState(initialData.version);
  const [requireLogin, setRequireLogin] = useState(initialData.requireLogin);

  // 파일 관련 상태
  const [newIcon, setNewIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>(initialData.iconUrl || "");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState("");

  // 스크린샷 관련 상태
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(initialData.screenshotUrls || []);
  const [newScreenshots, setNewScreenshots] = useState<File[]>([]);
  const [newScreenshotPreviews, setNewScreenshotPreviews] = useState<string[]>([]);

  // Firebase Storage 다이렉트 업로드
  const uploadToFirebase = async (fileToUpload: File, folder: string) => {
    const bucket = "tristan-archive.firebasestorage.app";
    const fileName = `${Date.now()}_${fileToUpload.name}`;
    const encodedPath = encodeURIComponent(`${folder}/${fileName}`);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodedPath}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": fileToUpload.type || "application/octet-stream" },
      body: fileToUpload,
    });

    if (!res.ok) throw new Error("파이어베이스 업로드 실패");
    const data = await res.json();
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${data.downloadTokens}`;
  };

  // 아이콘 변경
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setNewIcon(selected);
      setIconPreview(URL.createObjectURL(selected));
    }
  };

  // APK 파일 변경
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
      setNewFileName(e.target.files[0].name);
    }
  };

  // 새 스크린샷 추가
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewScreenshots(prev => [...prev, ...filesArray]);
      setNewScreenshotPreviews(prev => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
    }
  };

  // 기존 스크린샷 삭제
  const removeExistingScreenshot = (index: number) => {
    setExistingScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // 새 스크린샷 삭제
  const removeNewScreenshot = (index: number) => {
    setNewScreenshots(prev => prev.filter((_, i) => i !== index));
    setNewScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setUploadProgress("");

    try {
      const updateData: any = { title, description, detailedDescription, version, requireLogin };

      // 아이콘 교체
      if (newIcon) {
        setUploadProgress("아이콘 업로드 중...");
        updateData.iconUrl = await uploadToFirebase(newIcon, "icons");
      }

      // 새 스크린샷 업로드
      let uploadedNewScreenshots: string[] = [];
      if (newScreenshots.length > 0) {
        for (let i = 0; i < newScreenshots.length; i++) {
          setUploadProgress(`스크린샷 업로드 중... (${i + 1}/${newScreenshots.length})`);
          const url = await uploadToFirebase(newScreenshots[i], "screenshots");
          uploadedNewScreenshots.push(url);
        }
      }

      // 기존 유지 + 새로 추가된 스크린샷 합치기
      updateData.screenshotUrls = [...existingScreenshots, ...uploadedNewScreenshots];

      // APK 파일 교체
      if (newFile) {
        setUploadProgress("앱 파일(APK) 업로드 중...");
        updateData.fileUrl = await uploadToFirebase(newFile, "apps");
      }

      setUploadProgress("데이터 저장 중...");
      const res = await fetch(`/api/admin/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("앱 수정이 완료되었습니다! 🚂");
        router.refresh();
        router.push("/apps");
      } else {
        alert("수정 실패 ㅠㅠ");
      }
    } catch (error) {
      console.error(error);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 아이콘 교체 */}
      <div className="flex flex-col items-center gap-3 p-5 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
        <label className="text-xs font-black text-blue-600 uppercase tracking-widest">App Icon</label>
        <div className="relative group cursor-pointer">
          <input type="file" className="hidden" id="icon-edit" onChange={handleIconChange} accept="image/*" />
          <label htmlFor="icon-edit" className="block w-20 h-20 bg-white rounded-2xl shadow-inner overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all cursor-pointer">
            {iconPreview ? (
              <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-3xl">📸</span>
            )}
          </label>
        </div>
        <p className="text-[10px] text-blue-400 font-bold">클릭하여 아이콘 교체</p>
      </div>

      {/* 텍스트 필드 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">앱 이름</label>
        <input className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">한줄 설명</label>
        <textarea className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">상세 설명</label>
        <textarea className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white h-40 resize-none" value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} placeholder="앱에 대한 자세한 설명이나 업데이트 내용을 적어주세요." />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">버전</label>
        <input className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white" value={version} onChange={(e) => setVersion(e.target.value)} />
      </div>

      {/* 스크린샷 교체 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">스크린샷</label>

        {/* 기존 스크린샷 */}
        {existingScreenshots.length > 0 && (
          <div className="flex gap-3 overflow-x-auto py-2">
            {existingScreenshots.map((url, index) => (
              <div key={`existing-${index}`} className="relative flex-shrink-0 w-20 h-36 rounded-xl overflow-hidden border border-gray-600">
                <img src={url} alt={`screenshot-${index}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingScreenshot(index)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md hover:bg-red-600">X</button>
              </div>
            ))}
          </div>
        )}

        {/* 새 스크린샷 미리보기 */}
        {newScreenshotPreviews.length > 0 && (
          <div className="flex gap-3 overflow-x-auto py-2">
            {newScreenshotPreviews.map((src, index) => (
              <div key={`new-${index}`} className="relative flex-shrink-0 w-20 h-36 rounded-xl overflow-hidden border-2 border-blue-400">
                <img src={src} alt={`new-screenshot-${index}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewScreenshot(index)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md hover:bg-red-600">X</button>
                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[8px] px-1 rounded font-bold">NEW</span>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-center w-full h-12 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
          <span className="text-sm text-gray-400 font-bold">+ 스크린샷 추가</span>
          <input type="file" className="hidden" onChange={handleScreenshotsChange} accept="image/*" multiple />
        </label>
      </div>

      {/* APK 파일 교체 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-400">앱 파일 (APK)</label>
        <div className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 text-sm">
          {newFileName ? (
            <span className="text-blue-400 font-bold">새 파일: {newFileName}</span>
          ) : (
            <span>현재 파일 유지 (변경하려면 아래 버튼 클릭)</span>
          )}
        </div>
        <label className="flex items-center justify-center w-full h-12 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
          <span className="text-sm text-gray-400 font-bold">📁 새 APK 파일 선택</span>
          <input type="file" className="hidden" onChange={handleFileChange} accept=".apk,.ipa,.zip" />
        </label>
      </div>

      {/* 로그인 필요 토글 */}
      <label className="flex items-center gap-3 text-gray-700 font-bold">
        <input type="checkbox" className="w-5 h-5" checked={requireLogin} onChange={(e) => setRequireLogin(e.target.checked)} />
        로그인 필요 (STAFF ONLY)
      </label>

      {/* 업로드 진행 상황 */}
      {uploadProgress && (
        <div className="p-3 rounded-xl text-sm font-bold text-center bg-blue-50 text-blue-600 animate-pulse">
          {uploadProgress}
        </div>
      )}

      <button onClick={handleUpdate} disabled={isLoading} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-lg transition-all disabled:opacity-50">
        {isLoading ? "수정 중..." : "수정 완료"}
      </button>
    </div>
  );
}
