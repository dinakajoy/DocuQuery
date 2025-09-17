// import fs from "fs";
import fs from "fs/promises";
import path from "path";
import os from "os";
import tesseract from "node-tesseract-ocr";

import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

async function runOCR(filePath: string): Promise<string> {
  try {
    const text = await tesseract.recognize(filePath, {
      lang: "eng",
      oem: 1,
      psm: 3,
    });
    return text;
  } catch (err) {
    console.error("OCR failed:", err);
    return "";
  }
}

export async function extractContent(file: File, mimeType: string) {
  // Create a temporary file path
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `${Date.now()}-${file.name}`);

  // Write uploaded File → buffer → filesystem
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Detect extension
  const extension = path.extname(file.name).toLowerCase().replace(".", "");
  let content = "";

  try {
    switch (extension) {
      case "pdf":
        try {
          const loader = new PDFLoader(filePath);
          const docs = await loader.load();
          if (docs.length > 0)
            content = docs.map((d) => d.pageContent).join("\n");
        } catch (err) {
          console.error("PDF parse failed, fallback to OCR", err);
          content = await runOCR(filePath);
        }
        break;

      case "docx":
        try {
          const loader = new DocxLoader(filePath);
          const docs = await loader.load();
          if (docs.length > 0)
            content = docs.map((d) => d.pageContent).join("\n");
        } catch (err) {
          console.error("DOCX parse failed", err);
          content = "";
        }
        break;

      case "doc":
        try {
          const loader = new DocxLoader(filePath, {
            type: "doc",
          });
          const docs = await loader.load();
          if (docs.length > 0)
            content = docs.map((d) => d.pageContent).join("\n");
        } catch (err) {
          console.error("DOC parse failed", err);
          content = "";
        }
        break;

      case "txt":
        try {
          const loader = new TextLoader(filePath);
          const docs = await loader.load();
          if (docs.length > 0)
            content = docs.map((d) => d.pageContent).join("\n");
        } catch (err) {
          console.error("Text file load failed, fallback to raw read", err);
          content = await fs.readFile(filePath, "utf-8");
        }
        break;

      case "png":
      case "jpg":
      case "jpeg":
        content = await runOCR(filePath);

      default:
        console.warn(`Unsupported file type: ${mimeType}`);
        content = "";
    }
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }

  return content;
}
