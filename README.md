# DocuQuery – Q&A System on Your Own Data

DocuQuery is a **Question & Answer system** built with **Next.js, LangChain, and OpenAI embeddings**.  
It allows users to paste text, upload **documents, or images** and query them in natural language.  
All processing happens **in-memory** — nothing is persisted to disk or external storage.

---

## ✨ Features
- Upload **multiple data sources**:
  - Plain text (up to 5000 characters each)
  - Files (`.pdf`, `.docx`, `.doc`, `.txt`)
  - Images (OCR text extraction with Tesseract.js)
- Query your data in natural language
- Chunk documents and embed them using **OpenAI embeddings**
- In-memory vector store (no database required)
- Simple **chat-like UI** with markdown rendering
- Auto-scroll to latest answers

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router, React, TailwindCSS)
- **Backend**: Next.js API routes
- **AI/Embeddings**: [LangChain.js](https://js.langchain.com/) + OpenAI Embeddings
- **Vector Store**: In-memory `MemoryVectorStore` (FAISS optional)
- **OCR**: [Tesseract.js](https://github.com/naptha/tesseract.js)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/dinakajoy/DocuQuery.git
cd docu-query
```

### 2. Install dependencies
```
npm install
# or
yarn install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
OPENAI_API_KEY=your_openai_api_key
HF_API_KEY=your_huggingface_key   # optional if using HF embeddings

### 4. Run the development server
```
npm run dev
```

The app will be available at http://localhost:3000

## 🚀 Usage

1. Upload your data on the left panel:
  - Paste text into the textbox
  - Upload `.pdf`, `.docx`, `.doc`, `.txt`, or `image` files
2. Ask questions in the chatbox at the bottom
3. Get answers based on your uploaded content

## 🚀 Roadmap

- Add support for more file types (Excel, PPT, etc.)
- User authentication & persistence
- Streaming responses
- Improved UI/UX with conversation history

## ⚠️ Disclaimer

This is an experimental demo for learning and prototyping.
Uploaded data is processed in-memory and not persisted. For production, consider using a persistent vector database (like Pinecone, Weaviate, or FAISS).
