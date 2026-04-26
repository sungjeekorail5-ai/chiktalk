"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  const idRegex = /^[a-z0-9]{4,12}$/;
  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
  const pwRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCodeSent && !isCodeVerified && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setMessage({
        text: "인증 시간이 만료되었습니다. 다시 요청해주세요.",
        type: "error",
      });
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
    if (!email)
      return setMessage({ text: "이메일을 입력해주세요.", type: "error" });
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
    } catch {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code)
      return setMessage({ text: "인증번호를 입력해주세요.", type: "error" });
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
    } catch {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idRegex.test(id))
      return setMessage({ text: "아이디 형식이 올바르지 않습니다.", type: "error" });
    if (!nicknameRegex.test(nickname))
      return setMessage({
        text: "닉네임은 한글/영문/숫자 2~10자여야 합니다.",
        type: "error",
      });
    if (!isCodeVerified)
      return setMessage({ text: "이메일 인증을 완료해주세요.", type: "error" });
    if (!pwRegex.test(password))
      return setMessage({ text: "비밀번호 형식이 올바르지 않습니다.", type: "error" });
    if (password !== confirmPassword)
      return setMessage({ text: "비밀번호가 일치하지 않습니다.", type: "error" });

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: id, nickname, email, password }),
      });
      if (res.ok) {
        alert("칙칙톡톡 탑승을 환영합니다!");
        router.push("/login");
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "회원가입 실패", type: "error" });
      }
    } catch {
      setMessage({ text: "서버 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen md:bg-transparent md:min-h-0">
      <div className="max-w-md mx-auto px-5 md:px-4 pt-8 md:py-12 pb-12">
        <div className="md:bg-white md:p-10 md:rounded-[2.5rem] md:shadow-xl md:border md:border-gray-100">
          {/* 헤더 */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              회원가입
            </h1>
            <p className="text-sm text-gray-400 font-semibold">
              대한민국 철도인 커뮤니티에 합류하세요
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* 아이디 */}
            <Field
              label="아이디"
              hint={
                id && !idRegex.test(id)
                  ? "영문 소문자/숫자 4~12자"
                  : "영문 소문자, 숫자 조합 4~12자"
              }
              hintError={!!id && !idRegex.test(id)}
            >
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디 입력"
                className={inputCls}
                required
              />
            </Field>

            {/* 닉네임 */}
            <Field
              label="닉네임"
              hint={
                nickname && !nicknameRegex.test(nickname)
                  ? "한글/영문/숫자 2~10자"
                  : "한글, 영문, 숫자 2~10자"
              }
              hintError={!!nickname && !nicknameRegex.test(nickname)}
            >
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="활동명(닉네임)"
                className={inputCls}
                required
              />
            </Field>

            {/* 이메일 인증 */}
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-gray-700">
                이메일 인증
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="철도 이메일"
                  disabled={isCodeVerified}
                  className={`flex-1 ${inputCls} disabled:opacity-50`}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || isCodeVerified || !email}
                  className="w-full sm:w-auto shrink-0 px-5 py-3.5 bg-gray-900 active:bg-blue-600 text-white font-bold rounded-2xl text-sm transition-colors whitespace-nowrap disabled:opacity-50 active:scale-95"
                >
                  {isCodeSent ? "재전송" : "인증요청"}
                </button>
              </div>

              {isCodeSent && !isCodeVerified && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <div className="relative w-full sm:flex-1">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="인증번호 6자리"
                      className={inputCls}
                      maxLength={6}
                    />
                    <span
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold tracking-wider ${
                        timeLeft < 30 ? "text-red-500" : "text-blue-500"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="w-full sm:w-auto shrink-0 px-5 py-3.5 bg-blue-50 text-blue-600 active:bg-blue-100 font-bold rounded-2xl text-sm transition-colors whitespace-nowrap active:scale-95"
                  >
                    확인
                  </button>
                </div>
              )}
            </div>

            {/* 비밀번호 */}
            <Field
              label="비밀번호"
              hint="영문, 숫자, 특수문자 조합 8~20자"
              hintError={!!password && !pwRegex.test(password)}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className={`${inputCls} tracking-wider`}
                required
              />
            </Field>

            <Field
              label="비밀번호 재확인"
              hint={
                confirmPassword
                  ? password === confirmPassword
                    ? "비밀번호가 일치합니다"
                    : "비밀번호가 일치하지 않습니다"
                  : ""
              }
              hintError={
                !!confirmPassword && password !== confirmPassword
              }
              hintSuccess={
                !!confirmPassword && password === confirmPassword
              }
            >
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className={`${inputCls} tracking-wider`}
                required
              />
            </Field>

            {/* 메시지 */}
            {message.text && (
              <div
                className={`p-3 rounded-xl text-sm font-bold text-center ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isCodeVerified}
              className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-base mt-3"
            >
              {isLoading ? "처리 중..." : "가입 완료"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-400 active:text-blue-600 transition-colors"
            >
              이미 계정이 있으신가요?{" "}
              <span className="text-gray-900 font-bold ml-1">로그인</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3.5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[15px] font-semibold placeholder:text-gray-400";

function Field({
  label,
  hint,
  hintError,
  hintSuccess,
  children,
}: {
  label: string;
  hint?: string;
  hintError?: boolean;
  hintSuccess?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-bold text-gray-700">{label}</label>
      {children}
      {hint && (
        <p
          className={`text-[11px] font-semibold ${
            hintError
              ? "text-red-500"
              : hintSuccess
              ? "text-green-500"
              : "text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
