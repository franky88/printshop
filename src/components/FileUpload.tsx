"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import type { FileRef } from "@/lib/cart";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  ai: "application/illustrator",
  psd: "image/vnd.adobe.photoshop",
};
const ALL = ["pdf", "png", "jpg", "jpeg", "ai", "psd"];
const MAX = 100 * 1024 * 1024;

const size = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

type Props = {
  files: FileRef[];
  onChange: (f: FileRef[]) => void;
  extensions?: string[];
  maxFiles?: number;
  label?: string;
  prefix?: string;
};

export default function FileUpload({
  files,
  onChange,
  extensions = ALL,
  maxFiles = 10,
  label = "Add print file",
  prefix = "artwork",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const shown = extensions.filter((e) => e !== "jpeg").map((e) => e.toUpperCase());
  const list = shown.length > 1 ? `${shown.slice(0, -1).join(", ")} or ${shown[shown.length - 1]}` : shown[0];

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length) return;
    setError("");
    setBusy(true);
    let next = files;
    try {
      for (const file of picked) {
        if (next.length >= maxFiles) {
          throw new Error(maxFiles === 1 ? "Remove the current file to add a different one." : `You can add up to ${maxFiles} files.`);
        }
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        const type = extensions.includes(ext) ? TYPES[ext] : undefined;
        if (!type) throw new Error(`${file.name}: use a ${list} file.`);
        if (file.size > MAX) throw new Error(`${file.name} is over 100 MB.`);
        const blob = await upload(`${prefix}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: type,
          onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
        });
        next = [...next, { url: blob.url, name: file.name, size: file.size }];
        onChange(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    }
    setBusy(false);
    setProgress(0);
  }

  return (
    <div className="mt-4">
      {files.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm">
          {files.map((f) => (
            <li key={f.url} className="flex items-center justify-between gap-3">
              <span className="truncate">
                {f.name} <span className="text-ink/60">({size(f.size)})</span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(files.filter((x) => x.url !== f.url))}
                className="min-h-11 shrink-0 text-cyan-ink underline underline-offset-4 disabled:opacity-40"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-sm border-2 border-dashed border-ink/40 px-4 text-sm font-medium hover:border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan-ink">
        {busy ? `Uploading… ${progress}%` : label}
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={extensions.map((e) => `.${e}`).join(",")}
          onChange={onPick}
          disabled={busy}
          className="sr-only"
        />
      </label>
      <p className="mt-2 text-sm text-ink/65">{list}, up to 100 MB each.</p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
