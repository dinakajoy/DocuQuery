import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

export const chunkDocs = async (
  docs: { content: string; metadata?: Record<string, any> }[],
  chunkSize: number = 500
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 100,
  });
  const formattedDocs = docs.map(
    (doc) =>
      new Document({
        pageContent: doc.content,
        metadata: doc.metadata ?? {},
      })
  );
  return splitter.splitDocuments(formattedDocs);
};

// Convert to Faiss
export const saveToVectorStore = async (
  chunks: Document<Record<string, any>>[]
) => {
  try {
    return MemoryVectorStore.fromDocuments(chunks, embeddings);
  } catch (err) {
    console.error("Embedding creation failed:", err);
    throw err;
  }
};

export const askAndGetAnswer = async (
  memoryStore: MemoryVectorStore,
  q: string
) => {
  // The LLM
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Convert Memory store into retriever
  const retriever = memoryStore.asRetriever({ k: 3 });

  // Prompt template
  const prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant. Use the context below to answer the question.

Context:
{context}

Question:
{question}

Answer in a clear, concise way.
  `);

  // Get answer chain
  const chain = RunnableSequence.from([
    {
      context: async (input) => {
        const docs: any[] = await retriever.invoke(input.question);
        return docs.map((d) => d.pageContent).join("\n\n");
      },
      question: (input) => input.question,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  // Run query
  const response = await chain.invoke({ question: q });
  return response;
};
