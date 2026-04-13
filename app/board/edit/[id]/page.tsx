import { adminDb } from "@/lib/firebase-admin";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import EditClient from "./EditClient"; // 💡 아래에서 만들 입력 폼 컴포넌트

const ADMIN_ID = "sungjee90";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;

  // 💡 세션 확인 — 로그인한 사용자만 수정 페이지 접근 가능
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session || session === "guest_session") {
    redirect("/board");
  }

  // 1. 파이어베이스에서 기존 글 데이터 싹 긁어오기
  const doc = await adminDb.collection("posts").doc(id).get();
  if (!doc.exists) return notFound();

  const post = doc.data();

  // 💡 소유권 확인 — 본인 글이거나 관리자만 수정 가능
  if (post?.authorId !== session && session !== ADMIN_ID) {
    redirect("/board");
  }

  // 2. 긁어온 데이터를 클라이언트 컴포넌트(입력폼)로 넘겨줍니다!
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">✏️ 게시글 수정하기</h1>
      <EditClient
        postId={id}
        initialTitle={post?.title || ""}
        initialContent={post?.content || ""}
      />
    </div>
  );
}