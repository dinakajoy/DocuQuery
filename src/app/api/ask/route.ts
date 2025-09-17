import { NextRequest, NextResponse } from "next/server";
import {
  chunkDocs,
  saveToVectorStore,
  askAndGetAnswer,
} from "@/utils/askAnswer";

export async function POST(req: NextRequest) {
  try {
    const { docs, question } = await req.json();

    const chunks = await chunkDocs(docs);
    const memoryStore = await saveToVectorStore(chunks);
    const answer = await askAndGetAnswer(memoryStore, question);

    return NextResponse.json({ answer: answer }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Server error", details: e },
      { status: 500 }
    );
  }
}
