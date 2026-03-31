"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase"; // ⚠️ lib/firebase.ts에 storage가 설정되어 있어야 합니다.

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(""); 
  const [file, setFile] = useState<File | null>(null); // 📸 사진 파일 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // 1. 사진이 첨부되었다면 파이어베이스 Storage에 먼저 업로드
      if (file) {
        // 중복 방지를 위해 파일명 앞에 현재 시간(Date.now())을 붙입니다.
        const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref); // 업로드된 사진의 인터넷 접속 주소 가져오기
      }

      // 2. 글 내용과 사진 주소(imageUrl)를 DB에 저장하도록 API 호출
      const res = await fetch("/api/board/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author, imageUrl }), // imageUrl 파라미터 추가
      });

      if (res.ok) {
        alert("게시글이 등록되었습니다! ✨");
        router.push("/board");
        router.refresh();
      } else {
        alert("게시글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("등록 중 오류가 발생했습니다!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-8">새로운 글 작성 ✍️</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">작성자 명</label>
          <input 
            type="text" required value={author} onChange={(e)=>setAuthor(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
          <input 
            type="text" required value={title} onChange={(e)=>setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
          <textarea 
            required rows={10} value={content} onChange={(e)=>setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="내용을 자유롭게 적어주세요."
          />
        </div>
        
        {/* 📸 사진 첨부 입력란 추가 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">사진 첨부 (선택)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
          />
          {file && <p className="mt-2 text-sm text-blue-600 font-medium ml-2">선택된 파일: {file.name}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={()=>router.back()} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all">취소</button>
          <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all">
            {isSubmitting ? "사진 업로드 및 등록 중..." : "게시글 등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}