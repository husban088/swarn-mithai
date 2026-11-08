import { api, json } from "./api";

// Browser se seedha Cloudinary par upload (Vercel ki 4.5 MB body limit se bachne ke liye).
//
// 2 tareeqe hain:
//  1) UNSIGNED PRESET (recommended, API key ki permissions ka masla nahi aata):
//     client/.env me VITE_CLOUDINARY_CLOUD_NAME aur VITE_CLOUDINARY_PRESET set hon to yahi use hota hai.
//  2) SIGNED (purana tareeqa): server /admin/upload-sign se signature leta hai.
const PRESET = (import.meta.env.VITE_CLOUDINARY_PRESET || "").trim();
const CLOUD = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "").trim();

const friendly = (msg, status) => {
  const m = String(msg || "");
  if (/permission|forbidden|not allowed|actions/i.test(m))
    return (
      "Cloudinary ne upload block kiya: API key ke paas upload (create) permission nahi. " +
      "Cloudinary me unsigned upload preset banayein (steps bata diye hain) ya key ko Master/Admin role dein. [" +
      m +
      "]"
    );
  if (/cloud_name|Invalid cloud/i.test(m))
    return (
      "Cloudinary cloud name galat hai (l aur I ka farq check karein, dashboard se copy karein). [" +
      m +
      "]"
    );
  if (/preset/i.test(m))
    return (
      "Upload preset nahi mila ya Signed hai. Preset ka Signing Mode 'Unsigned' hona chahiye. [" +
      m +
      "]"
    );
  if (/Invalid Signature|api_key|Invalid api/i.test(m))
    return (
      "Cloudinary API key/secret galat hain (server/.env check karein). [" +
      m +
      "]"
    );
  return m || `Upload failed (${status}). Try again.`;
};

export async function uploadDirect(file, { signPath, kind = "image" } = {}) {
  const resource = kind === "video" ? "video" : "image";
  const fd = new FormData();
  fd.append("file", file);

  let cloud;
  if (PRESET && CLOUD) {
    // ---- Unsigned preset ----
    cloud = CLOUD;
    fd.append("upload_preset", PRESET);
    fd.append(
      "folder",
      resource === "video"
        ? "swarn/videos"
        : /review/.test(signPath || "")
          ? "swarn/reviews"
          : "swarn/products",
    );
  } else {
    // ---- Signed (server signature) ----
    const s = await api(signPath, json("POST", { kind }));
    cloud = s.cloud;
    fd.append("api_key", s.key);
    fd.append("timestamp", String(s.timestamp));
    fd.append("folder", s.folder);
    fd.append("signature", s.signature);
  }

  let r;
  try {
    r = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`,
      {
        method: "POST",
        body: fd,
      },
    );
  } catch {
    throw new Error(
      "Internet / Cloudinary tak pohanch nahi saka. Dobara try karein.",
    );
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.secure_url)
    throw new Error(friendly(d?.error?.message, r.status));
  return { url: d.secure_url };
}
