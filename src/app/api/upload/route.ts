import { NextRequest, NextResponse } from "next/server";
import { extractContent } from "@/utils/extractDocsContent";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    if (!formData)
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });

    const textField = formData.getAll("text");
    const files = formData.getAll("file");
    const docs = [];

    // Handle texts
    if (textField) {
      for (const t of textField) {
        // Validate that each text ≤ 5000 chars
        if (typeof t === "string" && t.length > 5000) {
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
    if (files) {
      // Validate that each file ≤ 20MB
      const totalSize = files.reduce((sum, f) => {
        if (f instanceof File) {
          return sum + f.size;
        }
        return sum;
      }, 0);
      if (totalSize > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Total upload size must be ≤ 20MB" },
          { status: 400 }
        );
      }

      for (const file of files) {
        if (file instanceof File) {
          const content = await extractContent(file, file.type);

          docs.push({
            id: crypto.randomUUID(),
            type: "file",
            name: file.name || "unnamed",
            content: content,
          });
        }
      }
    }

    // Validate max 5 docs
    if (docs.length > 5) {
      return NextResponse.json(
        { error: "Max 5 documents allowed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        docs: docs.map(({ id, type, name, content }) => ({
          id,
          type,
          name,
          content,
        })),
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Server error", details: e },
      { status: 500 }
    );
  }
}
