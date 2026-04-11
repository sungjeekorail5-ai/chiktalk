"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  id: string;
  nickname: string;
  korailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (id: string, nickname: string, korailVerified?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 앱이 켜질 때 로컬스토리지에서 로그인 정보를 복구합니다 (새로고침 방지)
  useEffect(() => {
    const savedUser = localStorage.getItem("chik_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (id: string, nickname: string, korailVerified?: boolean) => {
    const newUser = { id, nickname, korailVerified: korailVerified ?? false };
    setUser(newUser);
    localStorage.setItem("chik_user", JSON.stringify(newUser));
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }); // 서버 세션 삭제
    setUser(null);
    localStorage.removeItem("chik_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};