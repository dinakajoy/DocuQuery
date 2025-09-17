// import fs from "fs";
import fs from "fs/promises";
import path from "path";
import os from "os";
import Tesseract from "tesseract.js";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

async function runOCR(imagePath: string) {
  const workerPath = path.join(
    process.cwd(),
    "node_modules/tesseract.js/src/worker-script/node/index.js"
  );
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng", {
    workerPath,
  });
  return text;
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
      case "image/jpeg":
      case "image/png":
      case "image/jpg":
        content = await runOCR(filePath);
        break;

      default:
        console.warn(`Unsupported file type: ${mimeType}`);
        content = "";
    }
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }

  return content;
}
