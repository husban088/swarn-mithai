import { api, json } from "./api";

// Vercel function ki body limit ~4.5 MB hai, isliye file browser se seedha Cloudinary par jati hai.
// Server sirf signature deta hai (signPath: /admin/upload-sign ya /upload/review-sign).
export async function uploadDirect(file, { signPath, kind = "image" }) {
  const s = await api(signPath, json("POST", { kind }));
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", s.key);
  fd.append("timestamp", String(s.timestamp));
  fd.append("folder", s.folder);
  fd.append("signature", s.signature);
  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${s.cloud}/${s.resource}/upload`,
    { method: "POST", body: fd },
  );
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.secure_url)
    throw new Error(d?.error?.message || "Upload failed. Try again.");
  return { url: d.secure_url };
}
