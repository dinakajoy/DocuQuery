import { ChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export const askAndGetAnswer = async (faissStore: FaissStore, q: string) => {
  // 1. Define LLM
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // 2. Convert FAISS store into retriever
  const retriever = faissStore.asRetriever({ k: 3 });

  // 3. Prompt template
  const prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant. Use the context below to answer the question.

Context:
{context}

Question:
{question}

Answer in a clear, concise way.
  `);

  // 4. Chain = retriever → prompt → llm → output
  const chain = RunnableSequence.from([
    {
      context: async (input) => {
        const docs: any[] = await retriever.invoke(
          input.question
        );
        return docs.map((d) => d.pageContent).join("\n\n");
      },
      question: (input) => input.question,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  // 5. Run query
  const response = await chain.invoke({ question: q });
  return response;
};
