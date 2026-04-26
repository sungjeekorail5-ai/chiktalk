import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * /web/payroll/* 비회원 가드.
 * 칙칙톡톡 STAFF 세션이 없으면 로그인 페이지로 리다이렉트.
 * (/web 카탈로그에서도 이미 가드되지만, 직접 URL 접근 차단용)
 */
export default async function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const isStaff = !!session && session !== "guest_session";

  if (!isStaff) {
    redirect("/login");
  }

  return <>{children}</>;
}
