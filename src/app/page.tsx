"use client";

import { useState } from "react";

type DataSource = {
  type: "text" | "file" | "image";
  value: string | File | null;
};

export default function UploadDataForm() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [error, setError] = useState("");

  const MAX_SOURCES = 5;
  const MAX_TOTAL_SIZE_MB = 20;
  const MAX_FILE_SIZE_MB = 5;

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

  const addSource = (type: "text" | "file" | "image") => {
    if (sources.length >= MAX_SOURCES) {
      setError(`You can only add up to ${MAX_SOURCES} sources.`);
      return;
    }
    setSources([...sources, { type, value: null }]);
    setError("");
  };

  const updateSource = (index: number, value: string | File | null) => {
    const updated = [...sources];
    updated[index].value = value;

    if (value instanceof File) {
      if (value.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`Each file must be ≤ ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      const totalSize = getTotalSizeMB(updated);
      if (totalSize > MAX_TOTAL_SIZE_MB) {
        setError(
          `Total uploads must be ≤ ${MAX_TOTAL_SIZE_MB}MB. (Currently ${totalSize.toFixed(
            2
          )}MB)`
        );
        return;
      }
    }

    setError("");
    setSources(updated);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
    setError("");
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
    const err = validateBeforeSubmit();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const validSources = getValidSources(sources);
    console.log("Submitting sources:", validSources);
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
    console.log(data);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Left side input panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-700 shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {sources.map((src, index) => (
            <div
              key={index}
              className="border p-3 rounded-lg bg-gray-700 flex items-center gap-2"
            >
              <div className="flex-1">
                {src.type === "text" && (
                  <>
                    <textarea
                      placeholder="Paste text here..."
                      value={(src.value as string) || ""}
                      onChange={(e) => updateSource(index, e.target.value)}
                      maxLength={5000}
                      className="w-full border rounded-lg p-2"
                    />
                    <p className="text-sm text-gray-400">
                      {(src.value as string)?.length || 0}/5000 characters
                    </p>
                  </>
                )}
                {(src.type === "file" || src.type === "image") && (
                  <input
                    type="file"
                    accept={src.type === "file" ? ".pdf,.docx,.txt" : "image/*"}
                    onChange={(e) =>
                      updateSource(index, e.target.files?.[0] || null)
                    }
                    className="w-full border rounded-lg p-2"
                  />
                )}
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeSource(index)}
                className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add new sources */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => addSource("text")}
              className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer"
            >
              + Text
            </button>
            <button
              type="button"
              onClick={() => addSource("file")}
              className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer"
            >
              + File
            </button>
            <button
              type="button"
              onClick={() => addSource("image")}
              className="bg-purple-500 text-white px-3 py-1 rounded cursor-pointer"
            >
              + Image
            </button>
          </div>

          {/* Counter */}
          <p className="text-sm text-gray-300">
            {sources.length}/{MAX_SOURCES} sources added |{" "}
            {getTotalSizeMB(sources).toFixed(2)}/{MAX_TOTAL_SIZE_MB} MB used
          </p>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-auto bg-gray-300 text-gray-700 py-2 px-4 rounded-lg border hover:bg-gray-700 hover:text-gray-300 cursor-pointer"
          >
            Upload
          </button>
        </form>
      </div>
      {/* Right side panel */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Q&A System</h1>
        <p className="text-gray-600">
          Upload your data on the right to get started.
        </p>
      </div>
    </div>
  );
}
