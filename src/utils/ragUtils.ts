import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

// export const config = { api: { bodyParser: false } };

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

// Chunk Data
import { Document } from "langchain/document";

export const chunkDocs = async (
  docs: { pageContent: string; metadata?: Record<string, any> }[],
  chunkSize: number = 500
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: 100,
  });
  const formattedDocs = docs.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: doc.metadata ?? {},
      })
  );
  const chunks = await splitter.splitDocuments(formattedDocs);
  return chunks;
};

// Convert to Faiss
export const saveToFaiss = async (chunks: Document<Record<string, any>>[]) => {
  const faissStore = await FaissStore.fromDocuments(chunks, embeddings);
  return faissStore;
};

// Query Faiss
export const askAndGetAnswers = async (vectorStore: FaissStore, query: string) => {
  const result = await vectorStore.similaritySearch(query, 3);
  return result;
};
