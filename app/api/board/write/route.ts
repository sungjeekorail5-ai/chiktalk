import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { title, content, author } = await req.json();
    
    const postRef = await adminDb.collection("posts").add({
      title,
      content,
      author,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: postRef.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}