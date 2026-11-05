// Har product ki 5 (max 8) images ek saath Cloudinary par upload karke product me laga deta hai.
//
// Folder structure (project root me banayein):
//   product-images/
//     khoya-barfi/      1.jpg 2.jpg 3.jpg 4.jpg 5.jpg
//     almond-barfi/     1.jpg ... 5.jpg
//     special-event-box-16-pcs/  ...
//
// Folder ka naam = product ka naam (chhote letters, space ki jagah "-"). Pehli image (1) cover banti hai.
// Chalane ka tareeqa:  cd server && node scripts/upload-product-images.js
// Pehle sirf check karna ho:  node scripts/upload-product-images.js --dry
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const DRY = process.argv.includes("--dry");
const ROOT = path.join(__dirname, "..", "..", "product-images");
const MAX = 8;
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !CLOUDINARY_CLOUD_NAME ||
  !CLOUDINARY_API_KEY ||
  !CLOUDINARY_API_SECRET
) {
  console.error(
    "server/.env me SUPABASE_* aur CLOUDINARY_* keys poori honi chahiye.",
  );
  process.exit(1);
}
if (!fs.existsSync(ROOT)) {
  console.error(
    `Folder nahi mila: ${ROOT}\nProject root me "product-images" folder banayein.`,
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

async function upload(file) {
  const folder = "swarn/products";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex");
  const fd = new FormData();
  fd.append(
    "file",
    new Blob([fs.readFileSync(file)], {
      type: MIME[path.extname(file).toLowerCase()],
    }),
    path.basename(file),
  );
  fd.append("api_key", CLOUDINARY_API_KEY);
  fd.append("timestamp", String(timestamp));
  fd.append("folder", folder);
  fd.append("signature", signature);
  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd },
  );
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.secure_url)
    throw new Error(d?.error?.message || "Cloudinary upload failed");
  return d.secure_url;
}

(async () => {
  const { data: products, error } = await db.from("products").select("id,name");
  if (error) throw error;
  const bySlug = new Map(products.map((p) => [slug(p.name), p]));
  const dirs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory());
  let ok = 0;

  for (const d of dirs) {
    const p = bySlug.get(slug(d.name));
    if (!p) {
      console.warn(`SKIP  "${d.name}": is naam ka koi product nahi mila`);
      continue;
    }
    const files = fs
      .readdirSync(path.join(ROOT, d.name))
      .filter((f) => MIME[path.extname(f).toLowerCase()])
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .slice(0, MAX);
    if (!files.length) {
      console.warn(`SKIP  "${d.name}": folder me image nahi hai`);
      continue;
    }
    if (files.length < 5)
      console.warn(
        `NOTE  "${d.name}": sirf ${files.length} images hain (5 honi chahiye)`,
      );
    if (DRY) {
      console.log(`OK    ${p.name}: ${files.length} images`);
      continue;
    }

    try {
      const urls = [];
      for (const f of files)
        urls.push(await upload(path.join(ROOT, d.name, f)));
      const { error: e } = await db
        .from("products")
        .update({ images: urls, image_url: urls[0] })
        .eq("id", p.id);
      if (e) throw e;
      ok++;
      console.log(`DONE  ${p.name}: ${urls.length} images`);
    } catch (e) {
      console.error(`FAIL  ${p.name}: ${e.message}`);
    }
  }
  console.log(
    DRY
      ? "\nDry run poora. Ab bina --dry chalayein."
      : `\n${ok} products update ho gaye.`,
  );
})();
