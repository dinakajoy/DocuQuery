"use client";

import { useState } from "react";
import ChatArea from "@/components/ChatArea";
import Upload from "@/components/Upload";
import { DataSource } from "@/types";

export default function UploadDataForm() {
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [dataUploaded, setDataUploaded] = useState(false);
  const [error, setError] = useState("");
  const [docs, setDocs] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const MAX_TOTAL_SIZE_MB = 20;

  const getTotalSizeMB = (sources: DataSource[]) => {
    let total = 0;
    for (const src of sources) {
      if (src.type === "file" || src.type === "image") {
        const file = src.value as File;
        if (file) total += file.size;
      }
    }
    return total / (1024 * 1024);
  };

  const getValidSources = (sources: DataSource[]) => {
    return sources.filter((src) => {
      if (src.type === "text") {
        return src.value && (src.value as string).trim().length > 0;
      }
      if (src.type === "file" || src.type === "image") {
        return src.value instanceof File;
      }
      return false;
    });
  };

  const validateBeforeSubmit = () => {
    const validSources = getValidSources(sources);
    const totalSize = getTotalSizeMB(validSources);

    if (validSources.length === 0) {
      return "Please provide at least one valid data source.";
    }

    if (totalSize > MAX_TOTAL_SIZE_MB) {
      return `Total uploads must be ≤ ${MAX_TOTAL_SIZE_MB}MB. (Currently ${totalSize.toFixed(
        2
      )}MB)`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDataUploaded(false);
    const err = validateBeforeSubmit();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const validSources = getValidSources(sources);
    const formData = new FormData();
    validSources.forEach((src, i) => {
      if (src.type === "file" || src.type === "image") {
        formData.append("file", src.value as File);
      }
      if (src.type === "text") {
        formData.append("text", src.value as string);
      }
    });

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setDataUploaded(true);
    setDocs(data.docs);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs, question }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong." },
      ]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Left side input panel */}
      <div className="w-full md:w-1/3 bg-gray-700 shadow-lg p-6">
        {/* Upload component */}
        <Upload
          handleSubmit={handleSubmit}
          error={error}
          setError={setError}
          sources={sources}
          setSources={setSources}
        />
      </div>

      {/* Right side panel */}
      <div className="flex flex-col h-screen w-full">
        {/* Chat component */}
        <ChatArea
          messages={messages}
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          handleAsk={handleAsk}
          dataUploaded={dataUploaded}
        />
      </div>
    </div>
  );
}
