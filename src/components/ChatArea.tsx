"use client";

import React, { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import Loader from "@/components/Loader";

type ChatAreaProps = {
  messages: { role: "user" | "assistant"; content: string }[];
  loading: boolean;
  question: string;
  setQuestion: (q: string) => void;
  handleAsk: () => Promise<void>;
  dataUploaded: boolean;
};

export default function ChatArea({
  messages,
  dataUploaded,
  handleAsk,
  loading,
  question,
  setQuestion,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
      <div className="p-6 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Question & Answer System On Your Own Data
        </h1>
        <p className="text-gray-600">
          Upload your data on the right to get started.
        </p>
      </div>

      {/* Chat area */}
      {dataUploaded && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg prose prose-sm ${
                  msg.role === "user"
                    ? "mr-auto bg-blue-500 text-white prose-invert"
                    : "ml-auto bg-gray-200 text-gray-800 max-w-[90%]"
                }`}
              >
                <Markdown>{msg.content}</Markdown>
              </div>
            ))}
            {loading && <Loader />}
            <div ref={bottomRef} />
          </div>

          {/* Question Area */}
          <div className="p-4 border-t bg-white flex items-center">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 resize-none rounded-tl-md rounded-bl-md p-2 h-12 focus:outline-none focus:ring-0 border border-gray-800 text-gray-800"
            />
            <button
              onClick={handleAsk}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-tr-md rounded-br-md cursor-pointer font-bold border border-blue-500 hover:border-blue-600"
            >
              Ask
            </button>
          </div>
        </>
      )}
    </>
  );
}
