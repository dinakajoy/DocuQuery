import fs from "fs";
import Tesseract from "tesseract.js";

async function runOCR(filePath: string): Promise<string> {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(filePath, "eng", {
      logger: (m: any) => console.log(m),
    });
    return text;
  } catch (err) {
    console.error("OCR failed:", err);
    return "";
  }
}

export async function extractContent(filePath: string, mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      try {
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(fs.readFileSync(filePath));
        if (data.text.trim()) return data.text;
      } catch (err) {
        console.error("PDF parse failed, fallback to OCR", err);
        return runOCR(filePath);
      }
      break;

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;

    case "text/plain":
      return fs.readFileSync(filePath, "utf-8");

    case "image/png":
    case "image/jpg":
    case "image/jpeg":
      return runOCR(filePath);

    default:
      console.warn(`Unsupported file type: ${mimeType}`);
      return "";
  }
}
