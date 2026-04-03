"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function WritePage() {
  const router = useRouter();
  
  // 💡 [추가] 카테고리 상태 관리 (기본값: 자유게시판)
  const [category, setCategory] = useState("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // 📸 사진 상태 관리
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 📸 사진 압축 및 선택 함수
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const compressedFiles: File[] = [];
    const previewUrls: string[] = [];

    setIsLoading(true);

    const options = {
      maxSizeMB: 0.9,          
      maxWidthOrHeight: 1920, 
      useWebWorker: true,
    };

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
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 모두 입력해주세요.");
    
    setIsLoading(true);

    const formData = new FormData();
    // 💡 [추가] 카테고리 정보도 폼 데이터에 담아서 서버로 보냅니다!
    formData.append("category", category);
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
        alert(errorData.message || "등록 실패");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-4 space-y-6 md:space-y-8">
      
      {/* 💡 상단 타이틀 */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight">글쓰기</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        
        {/* 💡 [추가] 게시판 카테고리 선택 드롭다운 */}
        <div className="space-y-2">
          <label className="block text-sm md:text-base font-black text-gray-700 ml-1">
            게시판 선택
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-base md:text-lg transition-all appearance-none bg-white cursor-pointer"
              required
            >
              <option value="free">💬 게시판</option>
              <option value="inquiry">🙋‍♂️ 앱 문의사항</option>
            </select>
            {/* 커스텀 화살표 아이콘 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
              ▼
            </div>
          </div>
        </div>

        {/* 💡 제목 입력창 */}
        <div className="space-y-2">
          <label className="block text-sm md:text-base font-black text-gray-700 ml-1">
            제목
          </label>
          <input
            type="text" 
            placeholder="제목을 입력하세요" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required
            className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-base md:text-lg transition-all"
          />
        </div>
        
        {/* 💡 내용 입력창 (placeholder 제거) */}
        <div className="space-y-2">
          <label className="block text-sm md:text-base font-black text-gray-700 ml-1">
            내용
          </label>
          <textarea
            placeholder="" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            required 
            rows={12}
            className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm md:text-base whitespace-pre-wrap leading-relaxed min-h-[300px]"
          />
        </div>

        {/* 📸 사진 첨부 영역 */}
        <div className="space-y-4 bg-gray-50 p-4 md:p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-700 text-sm md:text-base">사진 첨부 (최대 5장)</label>
            <label 
              htmlFor="file-input" 
              className="bg-white border border-gray-200 text-blue-600 font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-xl cursor-pointer hover:bg-gray-100 text-xs md:text-sm transition-all shadow-sm"
            >
              사진 선택
            </label>
            <input 
              id="file-input" type="file" accept="image/*" multiple onChange={handleFileChange} 
              className="hidden" 
            />
          </div>

          {/* 미리보기 영역 (모바일에서 3열로 조절) */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3 pt-2">
              {previews.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-white">
                  <img src={url} alt={`미리보기 ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      setPreviews(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] md:text-xs text-gray-400 font-medium">※ 사진 한 장당 최대 5MB까지 첨부 가능합니다. (자동 압축)</p>
        </div>

        {/* 💡 등록 버튼 */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-4 md:py-5 rounded-2xl text-lg md:text-xl transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
          >
            {isLoading ? "등록 중... 🚄" : "CHIKCHIK에 글 등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}