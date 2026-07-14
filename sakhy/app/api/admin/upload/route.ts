import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

function checkMagicBytes(buffer: Uint8Array): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // WEBP: RIFF...WEBP
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }

  return null;
}

export async function POST(req: Request) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the stream and limit to 8MB
    const reader = file.stream().getReader();
    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 8MB limit" }, { status: 413 });
      }

      chunks.push(value);
    }

    const fileBuffer = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      fileBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const typeInfo = checkMagicBytes(fileBuffer);
    if (!typeInfo) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    const filename = `${crypto.randomUUID()}${typeInfo.ext}`;

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || "product-images")
      .upload(filename, fileBuffer, {
        contentType: typeInfo.mime,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || "product-images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
