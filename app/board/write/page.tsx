"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression"; // 💡 압축 라이브러리 임포트

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // 💡 사진 관리를 위한 상태들
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 📸 사진 선택 시 실행되는 함수
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const compressedFiles: File[] = [];
    const previewUrls: string[] = [];

    setIsLoading(true); // 압축 시작 시 로딩 표시

    // 💡 Vercel 제한(4.5MB)을 넘지 않기 위해 빡세게 압축합니다.
    const options = {
      maxSizeMB: 0.9,          // 1장당 1MB 미만으로 목표
      maxWidthOrHeight: 1920, // 가로세로 최대 1920px
      useWebWorker: true,
    };

    try {
      for (const file of files) {
        // 1. 이미지 압축 (이게 핵심!)
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);

        // 2. 미리보기 URL 생성
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
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 압축 완료 시 로딩 해제
    }
  };

  // 📝 글 등록 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요.");
    
    setIsLoading(true);

    // 💡 사진이 포함되므로 JSON 대신 FormData를 사용합니다.
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    
    // 압축된 파일들을 FormData에 담습니다.
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch("/api/board/write", {
        method: "POST",
        body: formData, // headers를 설정하지 않아야 브라우저가 알아서 Content-Type을 잡습니다.
      });

      if (res.ok) {
        router.push("/board");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "등록 실패 ㅠㅠ");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center gap-3">
        <span className="text-4xl">📸</span>
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">CHIKCHIK 사진관 영업 개시</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text" placeholder="제목을 입력하세요 (예: 멋진 KTX-청룡 포착!)" value={title} onChange={e => setTitle(e.target.value)} required
          className="w-full px-5 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
        />
        
        <textarea
          placeholder="여기에 기차 여행 이야기와 사진에 대한 설명을 남겨주세요... 🚂" value={content} onChange={e => setContent(e.target.value)} required rows={10}
          className="w-full px-5 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium whitespace-pre-wrap leading-relaxed"
        />

        {/* 📸 사진 첨부 영역 */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-700">여행 사진 첨부 (최대 5장)</label>
            <label htmlFor="file-input" className="bg-white border border-gray-200 text-blue-600 font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 text-sm transition-all">
              사진 선택
            </label>
            <input 
              id="file-input" type="file" accept="image/*" multiple onChange={handleFileChange} 
              className="hidden" // 기본 버튼은 숨깁니다.
            />
          </div>

          {/* 미리보기 영역 */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-3">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <img src={url} alt={`미리보기 ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      // 선택한 사진 삭제 로직
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      setPreviews(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold hover:bg-black"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 font-medium">※ Vercel 용량 제한으로 인해 사진은 자동으로 압축되어 업로드됩니다.</p>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-5 rounded-2xl text-xl transition-all shadow-lg shadow-blue-100 active:scale-95">
          {isLoading ? "사진 압축 및 전송 중... 🚄💨" : "CHIKCHIK에 글 등록하기"}
        </button>
      </form>
    </div>
  );
}