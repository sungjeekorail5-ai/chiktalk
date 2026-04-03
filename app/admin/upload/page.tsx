"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AppUploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(""); // 💡 진행 상황 표시용
  const [message, setMessage] = useState({ text: "", type: "" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [requireLogin, setRequireLogin] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedIcon = e.target.files[0];
      setIcon(selectedIcon);
      setIconPreview(URL.createObjectURL(selectedIcon));
    }
  };

  // 💡 [핵심] Vercel 안 거치고 파이어베이스 스토리지로 40MB 다이렉트 슛!
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
      body: fileToUpload, // 브라우저에서 직접 쏩니다!
    });

    if (!res.ok) throw new Error("파이어베이스 직접 업로드 실패");

    const data = await res.json();
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${data.downloadTokens}`;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "업로드할 앱 파일(APK 등)을 선택해주세요.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // 1️⃣ 아이콘 다이렉트 업로드
      let iconUrl = "";
      if (icon) {
        setUploadProgress("아이콘 업로드 중...");
        iconUrl = await uploadToFirebaseDirectly(icon, "icons");
      }

      // 2️⃣ 40MB APK 다이렉트 업로드 (Vercel 용량 제한 무시!)
      setUploadProgress("앱 파일(APK) 업로드 중... (40MB라 조금 걸립니다!)");
      const fileUrl = await uploadToFirebaseDirectly(file, "apps");

      // 3️⃣ DB에 글쓰기 (Vercel API로는 무거운 파일 빼고 '글자'만 보냅니다)
      setUploadProgress("데이터베이스 저장 중...");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          version,
          requireLogin,
          fileUrl, // 스토리지에서 받은 주소만 전송!
          iconUrl
        }),
      });

      if (res.ok) {
        alert("앱과 아이콘이 성공적으로 업로드되었습니다! 🚂💨");
        router.push("/apps");
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "업로드 실패", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "업로드 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-900 to-blue-600"></div>

        <div className="mb-10 border-b border-gray-50 pb-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-3">
            ⚙️ 관리자 전용 <span className="text-blue-600">앱 등록소</span>
          </h1>
          <p className="text-sm text-gray-400 font-bold mt-2">아이콘 이미지와 설치 파일을 함께 업로드합니다.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          
          <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-[2rem] border-2 border-dashed border-blue-200">
            <label className="text-xs font-black text-blue-600 uppercase tracking-widest">App Icon</label>
            <div className="relative group cursor-pointer">
              <input type="file" className="hidden" id="icon-upload" onChange={handleIconChange} accept="image/*" />
              <label htmlFor="icon-upload" className="block w-24 h-24 bg-white rounded-3xl shadow-inner flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                {iconPreview ? (
                  <img src={iconPreview} alt="Icon Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📸</span>
                )}
              </label>
            </div>
            <p className="text-[10px] text-blue-400 font-bold italic">클릭하여 앱 아이콘(PNG/JPG) 선택</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-2">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">App Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 급여계산기" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none" required />
            </div>

            <div className="col-span-1 space-y-2">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Version</label>
              <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-center font-bold text-blue-600 focus:outline-none" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="예: 철도인을 위한 맞춤형 급여 자동 계산기" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" required />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest">App File (.apk, .ipa, .zip)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">📁</span>
                <p className="text-sm text-gray-500 font-bold">
                  {file ? <span className="text-blue-600">{file.name}</span> : "설치 파일 선택"}
                </p>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".apk,.ipa,.zip" />
            </label>
          </div>

          <div className="p-5 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-between cursor-pointer" onClick={() => setRequireLogin(!requireLogin)}>
            <div>
              <p className="text-white font-black flex items-center gap-2">
                🔒 사내 전용 앱으로 설정 <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">STAFF ONLY</span>
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1">사내 직원만 다운로드 가능합니다.</p>
            </div>
            <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${requireLogin ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${requireLogin ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          {/* 💡 진행 상황 표시 */}
          {uploadProgress && (
            <div className="p-4 rounded-xl text-sm font-bold text-center bg-blue-50 text-blue-600 animate-pulse">
              {uploadProgress}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Link href="/apps" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-4 rounded-2xl flex items-center justify-center">
              취소
            </Link>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "업로드 중..." : "파이어베이스에 업로드"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}