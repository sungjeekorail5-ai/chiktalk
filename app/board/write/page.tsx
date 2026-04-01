"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase"; 
import { useAuth } from "../../../lib/AuthContext"; // 💡 AuthContext 가져오기 (경로 확인!)

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuth(); // 💡 로그인된 유저 정보(ID, 닉네임) 가져오기

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // const [author, setAuthor] = useState(""); 👈 닉네임 자동 연동하니까 이제 필요 없어요!
  const [file, setFile] = useState<File | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("로그인이 필요합니다! ⛔");
    
    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // 1. 사진이 첨부되었다면 파이어베이스 Storage에 먼저 업로드
      if (file) {
        const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. 글 내용과 사진 주소(imageUrl)를 DB에 저장하도록 API 호출
      const res = await fetch("/api/board/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          content, 
          userId: user.id,        // 💡 로그인된 아이디 자동 전송
          nickname: user.nickname, // 💡 로그인된 닉네임 자동 전송
          imageUrl 
        }), 
      });

      if (res.ok) {
        alert("열차 소식이 성공적으로 등록되었습니다! 🚂✨");
        router.push("/board/list"); // 목록 페이지로 이동 (경로에 맞춰 수정하세요)
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

  // 로그인 안 한 유저가 접근 시 차단
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-20 text-center font-black text-gray-400">
        로그인한 승객만 글을 쓸 수 있습니다. ⛔
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-black text-gray-950 italic">NEW POST ✍️</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        {/* 💡 작성자 입력창 대신 닉네임 표시로 변경 */}
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
          <label className="block text-xs font-black text-blue-400 mb-1 uppercase tracking-wider">Author</label>
          <div className="text-lg font-black text-blue-700 flex items-center gap-2">
             🚄 {user.nickname} 님 <span className="text-xs font-bold text-blue-300">(인증됨)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-black text-gray-700 mb-2 ml-1">제목</label>
          <input 
            type="text" required value={title} onChange={(e)=>setTitle(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold transition-all"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-gray-700 mb-2 ml-1">내용</label>
          <textarea 
            required rows={10} value={content} onChange={(e)=>setContent(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium transition-all"
            placeholder="내용을 자유롭게 적어주세요."
          />
        </div>
        
        <div>
          <label className="block text-sm font-black text-gray-700 mb-2 ml-1">사진 첨부 (선택)</label>
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 cursor-pointer transition-all"
            />
          </div>
          {file && <p className="mt-2 text-xs text-blue-600 font-black ml-2 animate-bounce">📸 {file.name} 준비 완료!</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={()=>router.back()} className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl transition-all">취소</button>
          <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 text-lg">
            {isSubmitting ? "열차 발송 중..." : "게시글 등록하기 🚂"}
          </button>
        </div>
      </form>
    </div>
  );
}