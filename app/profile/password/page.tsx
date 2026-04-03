"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function PasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다! ❌");
      return;
    }

    if (newPassword.length < 6) {
      alert("비밀번호는 최소 6자리 이상이어야 합니다! 🔒");
      return;
    }

    setIsLoading(true);

    try {
      // 🔐 보안을 위해 재인증 과정이 필요합니다. (로그인한 지 오래됐을 경우 대비)
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // 🚀 비밀번호 업데이트 발사!
      await updatePassword(auth.currentUser, newPassword);
      
      alert("비밀번호가 성공적으로 변경되었습니다! 🎉 다시 로그인해 주세요.");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        alert("현재 비밀번호가 틀렸습니다! 🚫");
      } else {
        alert("비밀번호 변경 중 에러가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-8 animate-fade-in">
      {/* 타이틀 영역 */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl text-gray-400 hover:text-gray-900 transition-colors">❮</button>
        <h1 className="text-2xl font-black text-gray-900">비밀번호 변경 <span className="text-blue-600">🔒</span></h1>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 whitespace-nowrap">현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="기존 비밀번호 입력"
            required
          />
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2 whitespace-nowrap">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-4"
            placeholder="새 비밀번호 (6자 이상)"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="새 비밀번호 확인"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-[1.5rem] font-black text-white transition-all active:scale-95 shadow-lg ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          }`}
        >
          {isLoading ? "변경 중..." : "비밀번호 변경하기 🚄"}
        </button>
      </form>
    </div>
  );
}