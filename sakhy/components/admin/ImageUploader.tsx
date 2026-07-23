"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("File exceeds 8MB limit.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange([...value, data.url]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-crimson text-xs">{error}</p>}
      
      <div className="flex flex-wrap gap-4">
        {value.map((url, i) => (
          <div key={i} className="relative w-24 h-24 border border-gold/20">
            <Image src={url} alt="Uploaded" fill className="object-cover" sizes="100px" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, index) => index !== i))}
              className="absolute -top-2 -right-2 bg-crimson text-ivory w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer"
            >
              &times;
            </button>
          </div>
        ))}

        {value.length < 12 && (
          <label className="w-24 h-24 border border-dashed border-gold/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/5 transition-colors text-gold">
            <span className="text-2xl leading-none mb-1">+</span>
            <span className="text-[10px] uppercase tracking-widest">
              {uploading ? "..." : "Upload"}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-[10px] text-muted uppercase tracking-widest">JPG, PNG, WebP • Max 8MB</p>
    </div>
  );
}
