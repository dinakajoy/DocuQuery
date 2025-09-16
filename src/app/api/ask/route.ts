import { NextApiRequest, NextApiResponse } from "next";
import { askAndGetAnswer } from "@/utils/askAnswer";
import { chunkDocs, saveToFaiss } from "@/utils/ragUtils";
// import { Document } from "langchain/document";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { docs, question } = req.body;

  const chunks = await chunkDocs(docs);
  const faissStore = await saveToFaiss(chunks);
  const answer = await askAndGetAnswer(faissStore, question);

  // type ChunkDocument = Record<string, any>;
  // const chunks: ChunkDocument[] = await chunkDocs(docs);
  // // Assuming each chunk has a 'text' property you want to use
  // const chunkStrings: string[] = chunks.map(chunk => chunk.text);
  // const faissStore = await saveToFaiss(chunkStrings);
  // const answer = await askAndGetAnswer(faissStore, question);

  return res.status(200).json({ answer });
}
