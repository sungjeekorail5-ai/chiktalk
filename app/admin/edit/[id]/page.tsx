import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import EditClient from "./EditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AppEditPage({ params }: Props) {
  const { id } = await params;
  const doc = await adminDb.collection("apps").doc(id).get();
  if (!doc.exists) return notFound();

  const appData = doc.data();

  return (
    <EditClient
      appId={id}
      initialData={{
        title: appData?.title || "",
        description: appData?.description || "",
        detailedDescription: appData?.detailedDescription || "",
        version: appData?.version || "1.0.0",
        requireLogin: appData?.requireLogin || false,
        iconUrl: appData?.iconUrl || "",
        screenshotUrls: appData?.screenshotUrls || [],
        fileUrl: appData?.fileUrl || "",
      }}
    />
  );
}
