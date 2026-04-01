import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import EditClient from "./EditClient"; // 💡 아래에서 만들 입력 폼 컴포넌트

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;

  // 1. 파이어베이스에서 기존 글 데이터 싹 긁어오기
  const doc = await adminDb.collection("posts").doc(id).get();
  if (!doc.exists) return notFound();

  const post = doc.data();

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