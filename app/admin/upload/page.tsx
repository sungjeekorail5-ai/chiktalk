"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AppUploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // 📝 앱 정보 상태 (성지님 API 규격에 맞춤)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [requireLogin, setRequireLogin] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "업로드할 앱 파일(APK 등)을 선택해주세요.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    // 💡 FormData 생성 (파일 전송을 위한 필수 방식)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("version", version);
    formData.append("requireLogin", requireLogin ? "true" : "false");
    formData.append("file", file);

    try {
      // 💡 성지님의 API 경로로 쏩니다!
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        // 🚨 fetch로 FormData를 보낼 때는 headers에 'Content-Type'을 수동으로 설정하면 안 됩니다! 브라우저가 알아서 해줌.
        body: formData, 
      });

      if (res.ok) {
        alert("앱이 성공적으로 스토리지에 업로드되었습니다! 🚂💨");
        router.push("/apps");
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "업로드 실패", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        
        {/* 상단 장식 */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-900 to-blue-600"></div>

        <div className="mb-10 border-b border-gray-50 pb-6">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-3">
            ⚙️ 관리자 전용 <span className="text-blue-600">앱 등록소</span>
          </h1>
          <p className="text-sm text-gray-400 font-bold mt-2">Firebase Storage에 실제 설치 파일을 업로드합니다.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          
          <div className="grid grid-cols-4 gap-4">
            {/* 앱 이름 입력 */}
            <div className="col-span-3 space-y-2">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">App Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 코레일 타이쿤"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 버전 정보 입력 */}
            <div className="col-span-1 space-y-2">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-center font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 한 줄 설명 */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 최고의 철도 시뮬레이션 게임!"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 💡 파일 업로드 (가장 중요!) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-widest">App File (.apk, .ipa, .zip)</label>
            <div className="relative flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="text-3xl mb-2">📁</span>
                  <p className="text-sm text-gray-500 font-bold">
                    {file ? <span className="text-blue-600">{file.name}</span> : "클릭하여 앱 파일 업로드"}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".apk,.ipa,.zip" // 필요에 따라 확장자 조절
                />
              </label>
            </div>
          </div>

          {/* 사내 전용 체크박스 (requireLogin) */}
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

          <div className="flex gap-4 pt-4">
            <Link href="/apps" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-4 rounded-2xl flex items-center justify-center transition-colors">
              취소
            </Link>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "업로드 중..." : "파이어베이스에 업로드"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}