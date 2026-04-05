import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import EditClient from "./EditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AppEditPage({ params }: Props) {
  const { id } = await params;

  // 1. 파이어베이스에서 기존 앱 데이터 긁어오기 (컬렉션 이름: apps)
  const doc = await adminDb.collection("apps").doc(id).get();
  
  if (!doc.exists) return notFound();

  const appData = doc.data();

  // 2. 긁어온 데이터를 클라이언트 컴포넌트(입력폼)로 넘겨주기
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">앱 수정하기</h1>
      <EditClient 
        appId={id}
        initialData={{
          title: appData?.title || "",
          description: appData?.description || "",
          detailedDescription: appData?.detailedDescription || "", // 💡 이 줄이 추가되었습니다!
          version: appData?.version || "1.0.0",
          requireLogin: appData?.requireLogin || false,
        }}
      />
    </div>
  );
}