"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // 📸 사진 관리를 위한 상태들
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 📸 사진 선택 시 실행되는 함수
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const compressedFiles: File[] = [];
    const previewUrls: string[] = [];

    setIsLoading(true);

    const options = {
      // 💡 Vercel 제한(4.5MB)을 고려하여 꽉 압축합니다.
      maxSizeMB: 0.9,          
      maxWidthOrHeight: 1920, 
      useWebWorker: true,
    };

    try {
      for (const file of files) {
        // 이미지 압축
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);

        // 미리보기 URL 생성
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
      setIsLoading(false);
    }
  };

  // 📝 글 등록 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 💡 내용 입력창 placeholder를 지웠지만, 필수 입력은 유지합니다.
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 모두 입력해주세요.");
    
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch("/api/board/write", {
        method: "POST",
        body: formData, 
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
      {/* 💡 1. CHIKCHIK 사진관 & 카메라 아이콘 -> 원래대로 '글쓰기'로 원상복구 */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">글쓰기</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 💡 2. 제목 입력창 -> 깔끔하게 '제목을 입력하세요'까지만 */}
        <input
          type="text" placeholder="제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} required
          className="w-full px-5 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
        />
        
        {/* 💡 3. 내용 입력창 -> placeholder 아예 지워버림 */}
        <textarea
          placeholder="" value={content} onChange={e => setContent(e.target.value)} required rows={10}
          className="w-full px-5 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium whitespace-pre-wrap leading-relaxed"
        />

        {/* 📸 사진 첨부 영역 */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between">
            {/* 💡 4. 여행 사진 첨부 -> 그냥 '사진 첨부'로 변경 */}
            <label className="font-bold text-gray-700">사진 첨부 (최대 5장)</label>
            <label htmlFor="file-input" className="bg-white border border-gray-200 text-blue-600 font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 text-sm transition-all">
              사진 선택
            </label>
            <input 
              id="file-input" type="file" accept="image/*" multiple onChange={handleFileChange} 
              className="hidden" 
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
          {/* 💡 5. Vercel 어쩌구 -> 승객들이 알아듣기 쉽게 '5MB까지'로 명확하게 변경 */}
          <p className="text-xs text-gray-400 font-medium">※ 사진 한 장당 최대 5MB까지 첨부 가능합니다. (자동 압축)</p>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-5 rounded-2xl text-xl transition-all shadow-lg shadow-blue-100 active:scale-95">
          {isLoading ? "사진 압축 및 전송 중... 🚄💨" : "CHIKCHIK에 글 등록하기"}
        </button>
      </form>
    </div>
  );
}