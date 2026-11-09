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

// ---- Tez upload ke liye: phone ki bari photo (3-10 MB) upload se pehle browser me hi chhoti kar di jati hai ----
// 1600 px tak, WebP/JPEG. Chhoti files, GIF aur SVG jaisi hain waisi hi jati hain.
const MAX_SIDE = 1600;
async function shrinkImage(file) {
  try {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return file;
    if (file.size < 350 * 1024) return file;
    let bmp;
    if (typeof createImageBitmap === "function") {
      bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    } else {
      bmp = await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = URL.createObjectURL(file);
      });
    }
    const w0 = bmp.width || bmp.naturalWidth;
    const h0 = bmp.height || bmp.naturalHeight;
    const k = Math.min(1, MAX_SIDE / Math.max(w0, h0));
    const w = Math.round(w0 * k);
    const h = Math.round(h0 * k);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    let blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.84));
    if (!blob || blob.type !== "image/webp")
      blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.86));
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, {
      type: blob.type,
    });
  } catch {
    return file; // koi bhi masla ho to original file hi upload hoti hai
  }
}

// Upload hote hi Cloudinary par site ke sizes pehle se bana lo (pehli baar bannay me der lagti hai),
// taake product card / list / detail me image foran dikhe.
function warm(url) {
  try {
    if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url || "")) return;
    for (const t of [
      "f_auto,q_auto,w_160,h_160,c_fill",
      "f_auto,q_auto,w_300,h_300,c_fill",
      "f_auto,q_auto:good,w_900",
    ]) {
      const i = new Image();
      i.decoding = "async";
      i.src = url.replace("/image/upload/", `/image/upload/${t}/`);
    }
  } catch {
    /* ignore */
  }
}

// Kai files ek saath (3 parallel). Order wahi rehta hai jo files ka tha.
export async function uploadMany(files, opts = {}, limit = 3) {
  const out = new Array(files.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < files.length) {
      const i = next++;
      try {
        out[i] = { ok: true, url: (await uploadDirect(files[i], opts)).url };
      } catch (err) {
        out[i] = { ok: false, error: err.message };
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, files.length) }, worker),
  );
  return out;
}

export async function uploadDirect(file, { signPath, kind = "image" } = {}) {
  const resource = kind === "video" ? "video" : "image";
  const fd = new FormData();
  if (resource === "image") file = await shrinkImage(file);
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
  if (resource === "image") warm(d.secure_url);
  return { url: d.secure_url };
}
