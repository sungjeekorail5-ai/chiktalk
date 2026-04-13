"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();

  // 📝 입력 상태 관리
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState(""); 
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ⚙️ UI 상태 관리
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  // ⏱️ 타이머 상태 관리
  const [timeLeft, setTimeLeft] = useState(180);

  // 💡 유효성 검사 규칙
  const idRegex = /^[a-z0-9]{4,12}$/; 
  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/; 
  const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/; 

  // ⏱️ 타이머 로직
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCodeSent && !isCodeVerified && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setMessage({ text: "인증 시간이 만료되었습니다. 다시 요청해주세요.", type: "error" });
      setIsCodeSent(false);
    }
    return () => clearInterval(timer);
  }, [isCodeSent, isCodeVerified, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSendCode = async () => {
    if (!email) return setMessage({ text: "이메일을 입력해주세요.", type: "error" });
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setIsCodeSent(true);
        setTimeLeft(180);
        setMessage({ text: "인증번호가 발송되었습니다.", type: "success" });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "발송 실패", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return setMessage({ text: "인증번호를 입력해주세요.", type: "error" });
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        setIsCodeVerified(true);
        setMessage({ text: "이메일 인증이 완료되었습니다.", type: "success" });
      } else {
        setMessage({ text: "인증번호가 일치하지 않습니다.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idRegex.test(id)) return setMessage({ text: "아이디 형식이 올바르지 않습니다.", type: "error" });
    if (!nicknameRegex.test(nickname)) return setMessage({ text: "닉네임은 한글/영문/숫자 2~10자여야 합니다.", type: "error" });
    if (!isCodeVerified) return setMessage({ text: "이메일 인증을 완료해주세요.", type: "error" });
    if (!pwRegex.test(password)) return setMessage({ text: "비밀번호 형식이 올바르지 않습니다.", type: "error" });
    if (password !== confirmPassword) return setMessage({ text: "비밀번호가 일치하지 않습니다.", type: "error" });

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: id, nickname, email, password }),
      });
      if (res.ok) {
        alert("칙칙톡톡 탑승을 환영합니다! 🚄💨");
        router.push("/login");
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "회원가입 실패", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            회원가입 <span className="text-blue-600">✍️</span>
          </h1>
          <p className="text-sm text-gray-400 font-bold">대한민국 철도인 커뮤니티에 합류하세요!</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          
          {/* 1️⃣ 아이디 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900">아이디</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="아이디 입력"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold"
              required
            />
            <p className={`text-[11px] font-bold ${id && !idRegex.test(id) ? 'text-red-500' : 'text-gray-400'}`}>
              * 영문 소문자, 숫자 조합 4~12자
            </p>
          </div>

          {/* 2️⃣ 닉네임 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="활동명(닉네임) 입력"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold"
              required
            />
            <p className={`text-[11px] font-bold ${nickname && !nicknameRegex.test(nickname) ? 'text-red-500' : 'text-gray-400'}`}>
              * 한글, 영문, 숫자 2~10자 (나중에 변경 가능)
            </p>
          </div>

          {/* 3️⃣ 이메일 인증 영역 (💡 모바일 튕김 방지 적용!) */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900">이메일 인증</label>
            {/* 💡 flex-col (모바일 세로) -> sm:flex-row (PC 가로) */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="철도 이메일 입력"
                disabled={isCodeVerified}
                className="w-full sm:flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading || isCodeVerified || !email}
                // 💡 w-full(모바일 꽉차게) sm:w-auto(PC 자기크기), 그리고 높이를 인풋창(py-4)과 맞췄습니다!
                className="w-full sm:w-auto shrink-0 px-6 py-4 bg-gray-900 hover:bg-blue-600 text-white font-black rounded-2xl text-sm transition-colors whitespace-nowrap disabled:opacity-50 active:scale-95"
              >
                {isCodeSent ? "재전송" : "인증요청"}
              </button>
            </div>

            {isCodeSent && !isCodeVerified && (
              // 💡 인증번호 입력칸도 동일하게 모바일 튕김 방지 적용
              <div className="flex flex-col sm:flex-row gap-2 mt-2 animate-fade-in">
                <div className="relative w-full sm:flex-1">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="인증번호 6자리"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold"
                    maxLength={6}
                  />
                  <span className={`absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black tracking-widest ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="w-full sm:w-auto shrink-0 px-6 py-4 bg-blue-100 text-blue-600 hover:bg-blue-200 font-black rounded-2xl text-sm transition-colors whitespace-nowrap active:scale-95"
                >
                  확인
                </button>
              </div>
            )}
          </div>

          {/* 4️⃣ 비밀번호 & 재확인 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold tracking-widest"
                required
              />
              <p className={`text-[11px] font-bold ${password && !pwRegex.test(password) ? 'text-red-500' : 'text-gray-400'}`}>
                * 영문, 숫자, 특수문자 조합 8~20자
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900">비밀번호 재확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm font-bold tracking-widest ${
                  confirmPassword 
                    ? password === confirmPassword 
                      ? 'border-green-400 focus:ring-green-400' 
                      : 'border-red-400 focus:ring-red-400'
                    : 'border-gray-100 focus:ring-blue-500'
                }`}
                required
              />
              {confirmPassword && (
                <p className={`text-[11px] font-bold ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                  {password === confirmPassword ? "✓ 비밀번호가 일치합니다." : "✗ 비밀번호가 일치하지 않습니다."}
                </p>
              )}
            </div>
          </div>

          {/* 메시지 */}
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isCodeVerified}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
          >
            {isLoading ? "처리 중..." : "열차 탑승 수속 완료 🎫"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
            이미 승차권이 있으신가요? <span className="text-gray-900 ml-1">로그인</span>
          </Link>
        </div>
      </div>
    </div>
  );
}