import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import formidable from "formidable";
import { extractContent } from "@/utils/extractDocsContent";

export default async function handler(req: NextRequest, res: NextResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
      if (err)
        return NextResponse.json({ error: "Invalid upload" }, { status: 400 });

      const docs: any[] = [];

      if (fields.text) {
        const textArray = Array.isArray(fields.text)
          ? fields.text
          : [fields.text];
        for (const t of textArray) {
          if (t.length > 5000) {
            return NextResponse.json(
              { error: "Textbox input exceeds 5000 characters" },
              { status: 400 }
            );
          }
          docs.push({
            id: crypto.randomUUID(),
            type: "text",
            name: "textbox",
            content: t,
          });
        }
      }

      // Handle files
      if (files.file) {
        // Handle files
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        const totalSize = fileArray.reduce((sum, f) => sum + (f.size || 0), 0);
        if (totalSize > 20 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Total upload size must be ≤ 20MB" },
            { status: 400 }
          );
        }

        for (const file of fileArray) {
          const getContent = await extractContent(
            file.filepath,
            file.mimetype || ""
          );
          docs.push({
            id: crypto.randomUUID(),
            type: "file",
            name: file.originalFilename || "unnamed",
            content: getContent,
          });
          // Optionally delete the temp file
          fs.unlink(file.filepath, () => {});
        }
      }

      // Final validation: max 5 docs, total ≤ 20MB (already validated on frontend)
      if (docs.length > 5) {
        return NextResponse.json(
          { error: "Max 5 documents allowed" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { docs: docs.map(({ id, type, name }) => ({ id, type, name })) },
        { status: 200 }
      );
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Server error", details: e },
      { status: 500 }
    );
  }
}
