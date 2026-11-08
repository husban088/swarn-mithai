require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const { STATUSES, buildStats } = require("./stats");
const bg = require("./bg");

const app = express();
app.set("trust proxy", true); // deploy (Vercel/Render/Nginx) ke peeche asli visitor IP milti rahe
// Gzip compression (JS/CSS/JSON 70% tak chhote). Package optional hai: install na ho to server pehle ki tarah chalta hai.
// Install: cd server && npm install compression
try {
  app.use(require("compression")());
} catch {
  /* compression install nahi: koi baat nahi */
}
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } =
  process.env;
const ready = !!(
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY &&
  SUPABASE_ANON_KEY
);
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const db = ready
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, opts)
  : null;
const anon = ready ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, opts) : null;
if (!ready)
  console.warn(
    "\n[WARN] server/.env me Supabase keys missing hain. .env.example copy karke .env banayein.\n",
  );

// Admin roles: har admin sirf apni country/brand ka data dekhta hai.
//   Pakistan admin  -> sirf Evelyn One (aqua) products + PKR orders
//   USA admin       -> sirf Mithai House (sweets) products + USD orders
// Badalne ke liye server/.env me PK_ADMIN_EMAILS / US_ADMIN_EMAILS likhein (comma separated).
const list = (v) =>
  String(v || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
const PK_ADMINS = list(process.env.PK_ADMIN_EMAILS || "wjahattahir@gmail.com");
const US_ADMINS = list(
  process.env.US_ADMIN_EMAILS || "shahidmahmood73@hotmail.com",
);
const ADMINS = [...PK_ADMINS, ...US_ADMINS];
const SCOPES = {
  PK: { country: "PK", category: "aqua", brand: "Evelyn One" },
  US: { country: "US", category: "sweets", brand: "Mithai House" },
};
const adminScopeFor = (e) => {
  const m = String(e || "").toLowerCase();
  if (PK_ADMINS.includes(m)) return SCOPES.PK;
  if (US_ADMINS.includes(m)) return SCOPES.US;
  return null;
};
const isAdminEmail = (e) => !!adminScopeFor(e);
// Region ke admins (order / contact emails sirf unhi ko jayen)
const adminsOf = (country) => (country === "PK" ? PK_ADMINS : US_ADMINS);

// ---- Admin data isolation: Evelyn One admin ko sirf water (aqua) orders, Mithai House admin ko sirf mithai (sweets) ----
// Order ke item ki category save hoti hai. Purane orders me na ho to naam se pehchante hain
// (water ke lafz = aqua, baqi sab mithai), bilkul client/src/lib/invoice.js jaisa.
const AQUA_WORDS =
  /\b(water|pani|aqua|bottle|bottles|jar|refill|dispenser|litre|liter|ltr|mineral|apna|evelyn)\b|\b\d+(\.\d+)?\s?(l|ml|ltr)\b/i;
const itemCat = (it) =>
  it?.category === "sweets" || it?.category === "aqua"
    ? it.category
    : AQUA_WORDS.test(String(it?.name || ""))
      ? "aqua"
      : "sweets";
// Order sirf tab admin ka hai jab uski country match kare AUR usme admin ki category ka koi item ho.
// Mix order ho to doosri category ke items nikal diye jate hain (mithai ki detail water admin ko nahi dikhti).
const scopeOrder = (o, sc) => {
  if (!o || o.country !== sc.country) return null;
  const items = Array.isArray(o.items) ? o.items : [];
  const mine = items.filter((it) => itemCat(it) === sc.category);
  if (!mine.length) return null;
  return mine.length === items.length ? o : { ...o, items: mine };
};
const scopeOrders = (rows, sc) =>
  (rows || []).map((o) => scopeOrder(o, sc)).filter(Boolean);

// ---------- Mail ----------
const mailer =
  process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
    : null;

async function sendMail(to, subject, html) {
  if (!mailer)
    return console.warn("[mail] SMTP set nahi hai, email skip hui:", subject);
  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("[mail] failed:", e.message);
  }
}
const wrapMail = (title, body, brand = "Mithai House") => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #B9D6FF;border-radius:14px;overflow:hidden">
  <div style="background:#0A1F44;padding:22px;text-align:center"><h1 style="margin:0;color:#6FAEFF;font-size:24px;letter-spacing:2px">${esc(String(brand).toUpperCase())}</h1></div>
  <div style="padding:24px;color:#222"><h2 style="margin-top:0">${title}</h2>${body}</div>
  <div style="background:#EEF5FF;padding:12px;text-align:center;font-size:12px;color:#1F5BBF">${esc(brand)}</div>
</div>`;
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

// ---------- Cloudinary (product + review images) ----------
const CLD = {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
};
const cldReady = !!(CLD.name && CLD.key && CLD.secret);
if (!cldReady)
  console.warn(
    "\n[WARN] server/.env me CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET missing hain. Image upload kaam nahi karega.\n",
  );

// Signed upload (koi extra npm package nahi chahiye, Node 18+ ka fetch/FormData)
async function cloudinaryUpload(file, folder, resource = "image") {
  if (!cldReady)
    throw new Error(
      "Cloudinary keys set nahi hain (server/.env me CLOUDINARY_* check karein).",
    );
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${CLD.secret}`)
    .digest("hex");
  const fd = new FormData();
  fd.append(
    "file",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || "upload",
  );
  fd.append("api_key", CLD.key);
  fd.append("timestamp", String(timestamp));
  fd.append("folder", folder);
  fd.append("signature", signature);
  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${CLD.name}/${resource === "video" ? "video" : "image"}/upload`,
    { method: "POST", body: fd },
  );
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.secure_url)
    throw new Error(d?.error?.message || "Cloudinary upload failed.");
  return d.secure_url;
}
const isCldUrl = (u) =>
  typeof u === "string" &&
  u.startsWith(`https://res.cloudinary.com/${CLD.name}/`) &&
  u.length < 500;

// Simple per-IP rate limit (spam se bachne ke liye)
const hits = new Map();
const tooMany = (req, key, max, ms) => {
  const k = `${key}:${req.ip}`;
  const now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < ms);
  if (arr.length >= max) {
    hits.set(k, arr);
    return true;
  }
  arr.push(now);
  hits.set(k, arr);
  return false;
};
setInterval(() => hits.clear(), 6 * 60 * 60 * 1000).unref();

// ---------- Helpers ----------
// ---------- Country detection (DB ki zarurat nahi) ----------
app.get("/api/geo", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const h = req.headers;
  const hdr =
    h["cf-ipcountry"] ||
    h["x-vercel-ip-country"] ||
    h["cloudfront-viewer-country"];
  if (hdr && /^[A-Za-z]{2}$/.test(hdr) && String(hdr).toUpperCase() !== "XX")
    return res.json({ country: String(hdr).toUpperCase() });
  const ip = String(h["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim()
    .replace("::ffff:", "");
  const local =
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const r = await fetch(
      `https://ipwho.is/${local ? "" : encodeURIComponent(ip)}`,
      { signal: ctrl.signal },
    );
    clearTimeout(t);
    const d = await r.json();
    if (d && d.country_code) return res.json({ country: d.country_code });
  } catch {
    /* ignore */
  }
  res.json({ country: null });
});

const needDb = (req, res, next) =>
  ready
    ? next()
    : res.status(500).json({
        error:
          "Server me Supabase keys set nahi hain (server/.env check karein).",
      });
app.use("/api", needDb);

const ah = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    const m = String(e?.message || e?.details || "");
    // Internet / DNS / VPN masla ho to saaf message dikhao
    const offline =
      /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(
        m + String(e?.details || ""),
      );
    res.status(offline ? 503 : 500).json({
      error: offline
        ? "Database se connection nahi ho raha. Internet / DNS / VPN check karein, phir page refresh karein."
        : m || "Server error",
    });
  });

const normCountry = (c) =>
  String(c || "").toUpperCase() === "PK" ? "PK" : "US";
const CATS = { US: ["sweets"], PK: ["sweets", "aqua"] };
const CUR = { US: "USD", PK: "PKR" };

// Pakistan me sirf Evelyn One (aqua) dikhta hai. Agar kisi email ko Pakistan me mithai bhi dikhani ho
// to server/.env me PK_MITHAI_EMAILS=a@x.com,b@y.com likhein (default: koi nahi).
const PK_MITHAI = (process.env.PK_MITHAI_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const canSeePkMithai = (u) =>
  !!u && PK_MITHAI.includes(String(u.email || "").toLowerCase());
const catsFor = (country, user) =>
  country === "PK"
    ? canSeePkMithai(user)
      ? ["sweets", "aqua"]
      : ["aqua"]
    : CATS.US;

// ---------- Live USD <-> PKR rate ----------
const FALLBACK_RATE = Number(process.env.PKR_PER_USD) || 280; // sirf tab jab internet par koi rate source na chale
const RATE_TTL = 10 * 60 * 1000;
let rateCache = {
  rate: FALLBACK_RATE,
  live: false,
  updated: null,
  source: "fallback",
  at: 0,
};
let rateInflight = null;
async function jsonFrom(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}
const RATE_SOURCES = [
  [
    "open.er-api.com",
    async () =>
      (await jsonFrom("https://open.er-api.com/v6/latest/USD")).rates?.PKR,
  ],
  [
    "currency-api (jsdelivr)",
    async () =>
      (
        await jsonFrom(
          "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
        )
      ).usd?.pkr,
  ],
  [
    "currency-api (pages)",
    async () =>
      (
        await jsonFrom(
          "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
        )
      ).usd?.pkr,
  ],
  [
    "exchangerate-api",
    async () =>
      (await jsonFrom("https://api.exchangerate-api.com/v4/latest/USD")).rates
        ?.PKR,
  ],
];
async function refreshRate() {
  for (const [name, fn] of RATE_SOURCES) {
    try {
      const v = Number(await fn());
      if (v > 50 && v < 2000) {
        rateCache = {
          rate: Math.round(v * 100) / 100,
          live: true,
          updated: new Date().toISOString(),
          source: name,
          at: Date.now(),
        };
        return rateCache;
      }
    } catch (e) {
      console.warn("[rate]", name, "failed:", e.message);
    }
  }
  // Koi source nahi chala: pichla rate (ya fallback) rakho, thori der baad dobara try
  rateCache = { ...rateCache, at: Date.now() - RATE_TTL + 60 * 1000 };
  return rateCache;
}
async function getRate() {
  if (Date.now() - rateCache.at < RATE_TTL) return rateCache;
  if (!rateInflight)
    rateInflight = refreshRate().finally(() => (rateInflight = null));
  return rateInflight;
}
getRate().then((r) =>
  console.log(`[rate] 1 USD = ${r.rate} PKR (${r.source})`),
);
setInterval(() => getRate().catch(() => {}), RATE_TTL).unref();

// Mithai ki base price USD hai: PKR live rate se banti hai. Aqua ki base price PKR hai.
const basePriceFor = (p, country, rate) => {
  if (!p) return null;
  const usd =
    p.price_usd != null && p.price_usd !== "" ? Number(p.price_usd) : null;
  const pkr =
    p.price_pkr != null && p.price_pkr !== "" ? Number(p.price_pkr) : null;
  if (country === "PK") {
    if (p.category === "sweets" && usd != null) return Math.round(usd * rate);
    return pkr;
  }
  if (usd != null) return usd;
  return pkr != null ? Math.round((pkr / rate) * 100) / 100 : null;
};

// Sale: admin 10% - 30% tak kisi bhi product par laga sakta hai (products.sale_percent).
// priceFor() ab discounted price deta hai, isi se cart total, order total aur payment banti hai.
const salePct = (p) => {
  const n = Math.round(Number(p?.sale_percent) || 0);
  return n >= 1 && n <= 90 ? n : 0;
};
const priceFor = (p, country, rate) => {
  const base = basePriceFor(p, country, rate);
  const pct = salePct(p);
  if (base == null || !pct) return base;
  const d = base * (1 - pct / 100);
  return country === "PK" ? Math.round(d) : Math.round(d * 100) / 100;
};

// Variants (options): har option ki apni price, note aur image. Sale % in par bhi lagti hai.
//  - Aqua (water): option ki price PKR me (price_pkr)
//  - Mithai (sweets): option ki price USD me (price_usd), e.g. Signature Box $12 / Special Box $20.
//    Pakistan me (jahan mithai dikhti hai) PKR live rate se banti hai.
const numOrNull = (x) =>
  x === "" || x == null || !Number.isFinite(Number(x)) ? null : Number(x);
const cleanVariants = (arr, category) =>
  (Array.isArray(arr) ? arr : [])
    .map((v, i) => ({
      key:
        String(v?.key || "")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 30) || `opt${i + 1}`,
      label: String(v?.label || "")
        .trim()
        .slice(0, 60),
      price_pkr: numOrNull(v?.price_pkr),
      price_usd: numOrNull(v?.price_usd),
      note: String(v?.note || "")
        .trim()
        .slice(0, 160),
      // Har option ki apni alag images (max 5). Purani single `image` bhi chalti hai.
      images: (() => {
        const list = (
          Array.isArray(v?.images) && v.images.length ? v.images : [v?.image]
        )
          .map((u) => String(u || "").trim())
          .filter((u) => /^https?:\/\//.test(u) && u.length < 500);
        return [...new Set(list)].slice(0, 5);
      })(),
    }))
    .map((v) => ({ ...v, image: v.images[0] || "" }))
    .filter((v) => {
      if (!v.label) return false;
      const px = category === "sweets" ? v.price_usd : v.price_pkr;
      // category pata na ho to jis ki price ho wahi chalega
      const ok = category ? px : (v.price_usd ?? v.price_pkr);
      return ok != null && ok >= 0;
    })
    .slice(0, 6);
const variantsOf = (p) => cleanVariants(p?.variants, p?.category);
// Option ki base price (sale se pehle), country ke hisaab se
const variantBase = (p, v, country, rate) => {
  if (p?.category === "sweets" && v.price_usd != null) {
    return country === "PK" ? Math.round(v.price_usd * rate) : v.price_usd;
  }
  if (v.price_pkr != null) {
    if (country === "PK" || !country) return v.price_pkr;
    return Math.round((v.price_pkr / rate) * 100) / 100;
  }
  return null;
};
// order me: product + variant key -> { v, price } (key na mile to pehla option)
const variantPick = (p, key, country = "PK", rate = FALLBACK_RATE) => {
  const list = variantsOf(p);
  if (!list.length) return null;
  const v = list.find((x) => x.key === key) || list[0];
  const base = variantBase(p, v, country, rate);
  if (base == null) return null;
  const pct = salePct(p);
  const d = pct ? base * (1 - pct / 100) : base;
  return {
    v,
    price: country === "PK" ? Math.round(d) : Math.round(d * 100) / 100,
    original: base,
  };
};

const shape = (p, country, rate) => ({
  variants: variantsOf(p)
    .map((v) => {
      const vp = variantPick(p, v.key, country, rate);
      return vp
        ? {
            key: v.key,
            label: v.label,
            note: v.note,
            image: v.image,
            images: v.images || [],
            price: vp.price,
            original_price: vp.original,
          }
        : null;
    })
    .filter(Boolean),
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  image_url: p.image_url,
  video_url: p.video_url || null,
  images:
    Array.isArray(p.images) && p.images.length
      ? p.images
      : p.image_url
        ? [p.image_url]
        : [],
  unit: p.unit,
  featured: p.featured,
  in_stock: p.in_stock,
  price: priceFor(p, country, rate),
  original_price: basePriceFor(p, country, rate),
  sale_percent: salePct(p),
  currency: CUR[country],
});

// ---------- Evelyn One 19 L "Refill" (PKR 200) ----------
// Refill option sirf us logged-in customer ko dikhta / milta hai jis ka pehla 19 L ("First time", PKR 1,500)
// order DELIVERED ho chuka ho. Owner jab tak order ko "delivered" na kare, kisi ko bhi Refill nahi dikhta.
const GATED_VARIANT = "refill";
async function refillUnlocked(user) {
  if (!user?.id) return false;
  const { data, error } = await db
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "delivered")
    .contains(
      "items",
      JSON.stringify([{ category: "aqua", variant: "first-time" }]),
    )
    .limit(1);
  if (error) throw error;
  return !!data?.length;
}

const userShape = (u) => ({
  id: u.id,
  email: u.email,
  name: u.user_metadata?.name || u.email.split("@")[0],
  phone: u.user_metadata?.phone || "",
  address: u.user_metadata?.address || "",
  city: u.user_metadata?.city || "",
  createdAt: u.created_at || null,
  isAdmin: isAdminEmail(u.email),
  adminScope: adminScopeFor(u.email),
  pkMithai: canSeePkMithai(u),
});

async function getUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return null;
  return userShape(data.user);
}
const requireAdmin = (req, res, next) =>
  req.user?.isAdmin
    ? next()
    : res.status(403).json({ error: "Admin access required." });
function auth(req, res, next) {
  getUser(req)
    .then((u) => {
      if (!u) return res.status(401).json({ error: "Please sign in again." });
      req.user = u;
      next();
    })
    .catch((e) => res.status(500).json({ error: e.message }));
}

// Guest bhi order kar sake: token ho to user milta hai, warna req.user = null
function optionalAuth(req, res, next) {
  getUser(req)
    .then((u) => {
      req.user = u || null;
      next();
    })
    .catch(() => {
      req.user = null;
      next();
    });
}

// ---------- Auth ----------
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post(
  "/api/auth/signup",
  ah(async (req, res) => {
    const { name, email, password, confirmPassword, phone, address, city } =
      req.body || {};
    if (!name?.trim())
      return res.status(400).json({ error: "Enter your name." });
    if (!emailRe.test(email || ""))
      return res.status(400).json({ error: "Enter a valid email address." });
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match." });

    const { error } = await db.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        phone: String(phone || "")
          .trim()
          .slice(0, 40),
        address: String(address || "")
          .trim()
          .slice(0, 200),
        city: String(city || "")
          .trim()
          .slice(0, 80),
      },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return res.status(exists ? 409 : 400).json({
        error: exists
          ? "This email is already registered. Please sign in."
          : error.message,
      });
    }
    const { data, error: e2 } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (e2) return res.status(400).json({ error: e2.message });
    const user = userShape(data.user);
    const pk = normCountry(req.body?.country) === "PK";
    const brandName = pk ? "Evelyn One" : "Mithai House";
    bg(
      sendMail(
        user.email,
        `Welcome to ${brandName}`,
        wrapMail(
          `Welcome, ${esc(user.name)}!`,
          pk
            ? "<p>Your account is ready. Order pure Evelyn One drinking water anytime.</p>"
            : "<p>Your account is ready. Browse our handcrafted mithai and place your first order anytime.</p>",
          brandName,
        ),
      ),
    );
    res.json({
      token: data.session.access_token,
      refresh: data.session.refresh_token,
      user,
    });
  }),
);

app.post(
  "/api/auth/signin",
  ah(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Enter your email and password." });
    const { data, error } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error)
      return res.status(401).json({ error: "Wrong email or password." });
    res.json({
      token: data.session.access_token,
      refresh: data.session.refresh_token,
      user: userShape(data.user),
    });
  }),
);

app.post(
  "/api/auth/refresh",
  ah(async (req, res) => {
    const { refresh_token } = req.body || {};
    if (!refresh_token)
      return res.status(400).json({ error: "Missing refresh token." });
    const { data, error } = await anon.auth.refreshSession({ refresh_token });
    if (error || !data?.session)
      return res
        .status(401)
        .json({ error: "Session expired. Please sign in." });
    res.json({
      token: data.session.access_token,
      refresh: data.session.refresh_token,
    });
  }),
);

app.get("/api/auth/me", auth, (req, res) => res.json({ user: req.user }));

app.put(
  "/api/auth/profile",
  auth,
  ah(async (req, res) => {
    const b = req.body || {};
    const name = String(b.name || "").trim();
    if (!name) return res.status(400).json({ error: "Enter your name." });
    const meta = {
      name: name.slice(0, 80),
      phone: String(b.phone || "")
        .trim()
        .slice(0, 40),
      address: String(b.address || "")
        .trim()
        .slice(0, 200),
      city: String(b.city || "")
        .trim()
        .slice(0, 80),
    };
    const { data, error } = await db.auth.admin.updateUserById(req.user.id, {
      user_metadata: meta,
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: userShape(data.user) });
  }),
);

// ---------- Public products (country aware) ----------
app.get(
  "/api/rates",
  ah(async (req, res) => {
    const r = await getRate();
    res.set("Cache-Control", "no-store");
    res.json({
      pkrPerUsd: r.rate,
      live: r.live,
      updated: r.updated,
      source: r.source,
    });
  }),
);

app.get(
  "/api/products",
  optionalAuth,
  ah(async (req, res) => {
    const country = normCountry(req.query.country);
    const rate = await getRate();
    const { data, error } = await db
      .from("products")
      .select("*")
      .in("category", catsFor(country, req.user))
      .order("created_at", { ascending: true });
    if (error) throw error;
    const hasGated = data.some(
      (p) =>
        p.category === "aqua" &&
        Array.isArray(p.variants) &&
        p.variants.some((v) => v?.key === GATED_VARIANT),
    );
    const unlocked = hasGated ? await refillUnlocked(req.user) : false;
    const list = data
      .map((p) => shape(p, country, rate.rate))
      .map((p) =>
        p.category === "aqua" && !unlocked
          ? {
              ...p,
              variants: p.variants.filter((v) => v.key !== GATED_VARIANT),
            }
          : p,
      )
      .filter((p) => p.price != null && Number.isFinite(p.price));
    res.set("Cache-Control", "no-store");
    res.json({
      country,
      currency: CUR[country],
      products: list,
      rate: { pkrPerUsd: rate.rate, live: rate.live, updated: rate.updated },
    });
  }),
);

// ---------- Product visits (kis product par kitne log aaye) ----------
// Har visit ka ek row save hota hai (koi 30 min wali limit nahi). Sirf 4 sec ke andar
// same visitor + same product ka double-click/double-fire ignore hota hai.
app.post(
  "/api/products/:id/view",
  ah(async (req, res) => {
    const id = String(req.params.id || "");
    const vid = String(req.body?.visitor_id || "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 64);
    if (!vid || !/^[0-9a-f-]{36}$/i.test(id)) return res.json({ ok: false });
    const since = new Date(Date.now() - 4000).toISOString();
    const recent = await db
      .from("product_views")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id)
      .eq("visitor_id", vid)
      .gte("created_at", since);
    if (!recent.error && recent.count) return res.json({ ok: true, dup: true });
    const { error } = await db
      .from("product_views")
      .insert({ product_id: id, visitor_id: vid });
    if (error) {
      console.warn("[views] insert failed:", error.message);
      return res.json({ ok: false, error: error.message });
    }
    res.json({ ok: true });
  }),
);

// ---------- Admin products ----------
const pickProduct = (b, forced) => {
  // Admin sirf apni category (Pakistan admin = aqua, USA admin = sweets) ke products bana/badal sakta hai
  const category = forced || (b.category === "aqua" ? "aqua" : "sweets");
  const num = (v) => (v === "" || v == null ? null : Number(v));
  const out = {
    name: String(b.name || "").trim(),
    description: String(b.description || "").trim(),
    category,
    image_url: null,
    images: [],
    video_url: null,
    price_usd: category === "aqua" ? null : num(b.price_usd),
    price_pkr: num(b.price_pkr),
    unit: String(b.unit || "").trim(),
    featured: !!b.featured,
    in_stock: b.in_stock !== false,
  };
  const imgs = (Array.isArray(b.images) ? b.images : [])
    .map((u) => String(u || "").trim())
    .filter((u) => /^https?:\/\//.test(u))
    .slice(0, 8);
  const cover = imgs[0] || (b.image_url ? String(b.image_url).trim() : null);
  out.images = imgs.length ? imgs : cover ? [cover] : [];
  out.image_url = out.images[0] || null;
  // Options (variants): water = PKR, mithai = USD (column supabase/mithai-boxes.sql se banta hai)
  out.variants = cleanVariants(b.variants, category);
  // Options hon to product ki base price = pehle option ki price (card par yahi default dikhti hai)
  if (out.variants.length) {
    if (category === "aqua") out.price_pkr = out.variants[0].price_pkr;
    else out.price_usd = out.variants[0].price_usd;
  }
  const vid = String(b.video_url || "").trim();
  out.video_url = /^https?:\/\//.test(vid) && vid.length < 600 ? vid : null;
  if (!out.name) throw new Error("Product name is required.");
  if (out.price_pkr != null && (isNaN(out.price_pkr) || out.price_pkr < 0))
    throw new Error("Invalid PKR price.");
  if (out.price_usd != null && (isNaN(out.price_usd) || out.price_usd < 0))
    throw new Error("Invalid USD price.");
  if (category === "sweets" && out.price_usd == null)
    throw new Error("Sweets need a USD price (sold in USA).");
  if (category === "aqua" && out.price_pkr == null)
    throw new Error("PKR price is required for Aqua water.");
  return out;
};
const bad = (res, e) => res.status(400).json({ error: e.message });

app.get(
  "/api/admin/products",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const { data, error } = await db
      .from("products")
      .select("*")
      .eq("category", req.user.adminScope.category)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ products: data });
  }),
);

app.post(
  "/api/admin/products",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    let row;
    try {
      row = pickProduct(req.body || {}, req.user.adminScope.category);
    } catch (e) {
      return bad(res, e);
    }
    const { data, error } = await db
      .from("products")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    res.json({ product: data });
  }),
);

app.put(
  "/api/admin/products/:id",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    let row;
    try {
      row = pickProduct(req.body || {}, req.user.adminScope.category);
    } catch (e) {
      return bad(res, e);
    }
    const { data, error } = await db
      .from("products")
      .update(row)
      .eq("id", req.params.id)
      .eq("category", req.user.adminScope.category)
      .select()
      .single();
    if (error) throw error;
    res.json({ product: data });
  }),
);

app.delete(
  "/api/admin/products/:id",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const { error } = await db
      .from("products")
      .delete()
      .eq("id", req.params.id)
      .eq("category", req.user.adminScope.category);
    if (error) throw error;
    res.json({ ok: true });
  }),
);

// ---------- Admin: sale (10% - 30%) ----------
// body: { percent: 0 | 10..30, scope: "all" | "category" | "ids", category?, ids? }
// percent 0 = sale band
app.post(
  "/api/admin/sale",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const b = req.body || {};
    const percent = Math.round(Number(b.percent));
    if (
      !Number.isFinite(percent) ||
      percent < 0 ||
      (percent > 0 && (percent < 10 || percent > 30))
    )
      return res.status(400).json({
        error: "Sale 10% se 30% ke beech honi chahiye (0 = sale band).",
      });
    let q = db
      .from("products")
      .update({ sale_percent: percent })
      .eq("category", req.user.adminScope.category);
    if (b.scope === "ids") {
      const ids = (Array.isArray(b.ids) ? b.ids : [])
        .map(String)
        .filter((i) => /^[0-9a-f-]{36}$/i.test(i));
      if (!ids.length)
        return res
          .status(400)
          .json({ error: "Kam az kam ek product chunein." });
      q = q.in("id", ids);
    } else if (b.scope === "category") {
      if (b.category !== req.user.adminScope.category)
        return res.status(400).json({ error: "Invalid category." });
    } else {
      q = q.neq("id", "00000000-0000-0000-0000-000000000000");
    }
    const { data, error } = await q.select("id");
    if (error) {
      if (/sale_percent/i.test(error.message || ""))
        return res.status(400).json({
          error:
            "Database me sale_percent column nahi hai. supabase/sale.sql ko Supabase SQL Editor me run karein.",
        });
      throw error;
    }
    res.json({ ok: true, updated: data.length, percent });
  }),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
// multer ke errors (badi file) ko JSON me wapis bhejta hai
const oneImage = (req, res, next) =>
  upload.single("image")(req, res, (e) =>
    e
      ? res.status(400).json({
          error:
            e.code === "LIMIT_FILE_SIZE"
              ? "Image 10 MB se choti honi chahiye."
              : e.message,
        })
      : next(),
  );
const checkImage = (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Choose an image first." });
    return false;
  }
  if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(req.file.mimetype)) {
    res.status(400).json({ error: "Only JPG, PNG, WEBP or GIF images." });
    return false;
  }
  return true;
};

// Vercel function ki body limit ~4.5 MB hai, isliye files browser se seedha Cloudinary par jati hain.
// Server sirf signature deta hai (secret kabhi browser ko nahi milta).
const cldSign = (folder, resource) => {
  if (!cldReady)
    throw new Error(
      "Cloudinary keys set nahi hain (CLOUDINARY_* environment variables check karein).",
    );
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${CLD.secret}`)
    .digest("hex");
  return {
    cloud: CLD.name,
    key: CLD.key,
    timestamp,
    folder,
    signature,
    resource,
  };
};
app.post(
  "/api/admin/upload-sign",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const video = req.body?.kind === "video";
    res.json(
      cldSign(
        video ? "swarn/videos" : "swarn/products",
        video ? "video" : "image",
      ),
    );
  }),
);
app.post(
  "/api/upload/review-sign",
  ah(async (req, res) => {
    if (tooMany(req, "rimg", 30, 60 * 60 * 1000))
      return res
        .status(429)
        .json({ error: "Bohat zyada uploads. Thori der baad try karein." });
    res.json(cldSign("swarn/reviews", "image"));
  }),
);

// Admin: product images -> Cloudinary
app.post(
  "/api/admin/upload",
  auth,
  requireAdmin,
  oneImage,
  ah(async (req, res) => {
    if (!checkImage(req, res)) return;
    res.json({ url: await cloudinaryUpload(req.file, "swarn/products") });
  }),
);

// Admin: product video -> Cloudinary (mp4 / webm / mov, max 60 MB)
const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
});
const oneVideo = (req, res, next) =>
  uploadVideo.single("video")(req, res, (e) =>
    e
      ? res.status(400).json({
          error:
            e.code === "LIMIT_FILE_SIZE"
              ? "Video 60 MB se choti honi chahiye."
              : e.message,
        })
      : next(),
  );
app.post(
  "/api/admin/upload-video",
  auth,
  requireAdmin,
  oneVideo,
  ah(async (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "Choose a video first." });
    if (!/^video\/(mp4|webm|quicktime|x-m4v)$/.test(req.file.mimetype))
      return res.status(400).json({ error: "Only MP4, WEBM or MOV video." });
    res.json({
      url: await cloudinaryUpload(req.file, "swarn/videos", "video"),
    });
  }),
);

// Public: review images -> Cloudinary (har koi, login zaruri nahi)
app.post(
  "/api/upload/review",
  oneImage,
  ah(async (req, res) => {
    if (tooMany(req, "rimg", 30, 60 * 60 * 1000))
      return res
        .status(429)
        .json({ error: "Bohat zyada uploads. Thori der baad try karein." });
    if (!checkImage(req, res)) return;
    res.json({ url: await cloudinaryUpload(req.file, "swarn/reviews") });
  }),
);

// Public: bank payment receipt (Mithai House / Citibank) -> Cloudinary
// Sirf JPG / PNG / WEBP. Checkout par order tab hi place hota hai jab receipt upload ho chuki ho.
app.post(
  "/api/upload/receipt",
  oneImage,
  ah(async (req, res) => {
    if (tooMany(req, "receipt", 20, 60 * 60 * 1000))
      return res
        .status(429)
        .json({ error: "Too many uploads. Please try again a little later." });
    if (!req.file)
      return res
        .status(400)
        .json({ error: "Please choose your receipt image first." });
    if (!/^image\/(jpeg|png|webp)$/.test(req.file.mimetype))
      return res.status(400).json({
        error:
          "Receipt must be a JPG, PNG or WEBP image (screenshot or photo).",
      });
    if (req.file.size < 8 * 1024)
      return res.status(400).json({
        error:
          "This image is too small to be a receipt. Upload the full, clear receipt.",
      });
    res.json({ url: await cloudinaryUpload(req.file, "swarn/receipts") });
  }),
);
// Order ke saath sirf wahi receipt URL qabool hota hai jo hamare Cloudinary ke receipts folder ka ho
const isReceiptUrl = (u) =>
  isCldUrl(u) && u.includes("/swarn/receipts/") && !/\s/.test(u);

// ---------- Reviews (har koi review de sakta hai) ----------
const reviewShape = (r, user) => ({
  id: r.id,
  name: r.name,
  rating: r.rating,
  comment: r.comment,
  images: Array.isArray(r.images) ? r.images : [],
  created_at: r.created_at,
  can_delete:
    !!user && (user.isAdmin || (!!r.user_id && r.user_id === user.id)),
});

app.get(
  "/api/products/:id/reviews",
  optionalAuth,
  ah(async (req, res) => {
    const id = String(req.params.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.json({ reviews: [] });
    const { data, error } = await db
      .from("reviews")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    res.set("Cache-Control", "no-store");
    res.json({ reviews: data.map((r) => reviewShape(r, req.user)) });
  }),
);

app.post(
  "/api/products/:id/reviews",
  optionalAuth,
  ah(async (req, res) => {
    if (tooMany(req, "review", 10, 60 * 60 * 1000))
      return res
        .status(429)
        .json({ error: "Bohat zyada reviews. Thori der baad try karein." });
    const id = String(req.params.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id))
      return res.status(400).json({ error: "Invalid product." });
    const b = req.body || {};
    const rating = parseInt(b.rating, 10);
    if (!(rating >= 1 && rating <= 5))
      return res.status(400).json({ error: "Please select a star rating." });
    const comment = String(b.comment || "")
      .trim()
      .slice(0, 1500);
    const images = (Array.isArray(b.images) ? b.images : [])
      .filter(isCldUrl)
      .slice(0, 4);
    const name =
      (req.user?.name || String(b.name || "").trim()).slice(0, 60) || "Guest";
    const email = (req.user?.email || String(b.email || "").trim()).slice(
      0,
      120,
    );
    if (!emailRe.test(email))
      return res.status(400).json({ error: "Enter a valid email address." });
    const { data: prod } = await db
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (!prod) return res.status(404).json({ error: "Product not found." });
    const row = {
      product_id: id,
      user_id: req.user?.id || null,
      name,
      rating,
      comment,
      images,
    };
    let { data, error } = await db
      .from("reviews")
      .insert({ ...row, email })
      .select()
      .single();
    // supabase/payments.sql abhi run nahi hua (email column nahi) to bhi review save ho jaye
    if (error && /email/i.test(error.message || "")) {
      ({ data, error } = await db
        .from("reviews")
        .insert(row)
        .select()
        .single());
    }
    if (error) throw error;
    res.json({ review: reviewShape(data, req.user) });
  }),
);

app.delete(
  "/api/reviews/:id",
  optionalAuth,
  ah(async (req, res) => {
    if (!req.user)
      return res.status(401).json({ error: "Please sign in again." });
    const { data: r } = await db
      .from("reviews")
      .select("id,user_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (!r) return res.status(404).json({ error: "Review not found." });
    if (!req.user.isAdmin && r.user_id !== req.user.id)
      return res.status(403).json({ error: "Not allowed." });
    const { error } = await db.from("reviews").delete().eq("id", r.id);
    if (error) throw error;
    res.json({ ok: true });
  }),
);

// ---------- Contact ----------
app.post(
  "/api/contact",
  ah(async (req, res) => {
    const { name, email, message, country } = req.body || {};
    if (!name?.trim() || !emailRe.test(email || "") || !message?.trim())
      return res
        .status(400)
        .json({ error: "Fill in name, a valid email and your message." });
    const cc = normCountry(country);
    const regional = adminsOf(cc);
    const to = regional.length
      ? regional.join(",")
      : ADMINS.length
        ? ADMINS.join(",")
        : process.env.SMTP_USER;
    if (to)
      await sendMail(
        to,
        `Contact message from ${name.trim()}`,
        wrapMail(
          "New contact message",
          `<p><b>${esc(name)}</b> (${esc(email)})</p><p>${esc(message).replace(/\n/g, "<br>")}</p>`,
          cc === "PK" ? "Evelyn One" : "Mithai House",
        ),
      );
    res.json({ ok: true });
  }),
);

// ---------- Orders + Payments (COD / Stripe / PayPal) ----------
require("./payments")({
  app,
  db,
  optionalAuth,
  ah,
  normCountry,
  CATS,
  catsFor,
  getRate,
  priceFor,
  CUR,
  esc,
  sendMail,
  wrapMail,
  emailRe,
  ADMINS,
  adminsOf,
  variantPick,
  isReceiptUrl,
  refillUnlocked,
  GATED_VARIANT,
});

async function fetchAll(table, cols, paidOnly = false, country = null) {
  let all = [];
  for (let from = 0; ; from += 1000) {
    let q = db.from(table).select(cols);
    if (paidOnly) q = q.neq("payment_status", "awaiting");
    if (country) q = q.eq("country", country);
    const { data, error } = await q
      .order("created_at", { ascending: true })
      .range(from, from + 999);
    if (error) throw error;
    all = all.concat(data);
    if (data.length < 1000) break;
  }
  return all;
}

app.get(
  "/api/admin/stats",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const sc = req.user.adminScope;
    const orders = scopeOrders(
      await fetchAll(
        "orders",
        "id,status,total,currency,items,created_at,country",
        true,
        sc.country,
      ),
      sc,
    );
    const { data: prods, error } = await db
      .from("products")
      .select("id,name,category,featured,in_stock")
      .eq("category", sc.category);
    if (error) throw error;
    let views = [];
    let warning = null;
    try {
      const rows = await fetchAll("product_views", "product_id,visitor_id");
      const m = new Map();
      for (const r of rows) {
        const e = m.get(r.product_id) || {
          product_id: r.product_id,
          views: 0,
          set: new Set(),
        };
        e.views += 1;
        e.set.add(r.visitor_id);
        m.set(r.product_id, e);
      }
      views = [...m.values()].map((e) => ({
        product_id: e.product_id,
        views: e.views,
        visitors: e.set.size,
      }));
    } catch (e) {
      warning =
        "Visitor tracking error: " +
        (e.message || "unknown") +
        ". Run supabase/update.sql in Supabase SQL Editor.";
    }
    res.set("Cache-Control", "no-store");
    res.json({ ...buildStats(orders, prods, views), warning });
  }),
);

// Sales page (graph + filters + invoices) ke liye saare paid/COD orders (full data)
app.get(
  "/api/admin/sales",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const orders = scopeOrders(
      await fetchAll("orders", "*", true, req.user.adminScope.country),
      req.user.adminScope,
    );
    res.set("Cache-Control", "no-store");
    res.json({ orders });
  }),
);

app.get(
  "/api/orders/mine",
  auth,
  ah(async (req, res) => {
    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("user_id", req.user.id)
      .neq("payment_status", "awaiting")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json({ orders: data });
  }),
);

app.get(
  "/api/admin/orders",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("country", req.user.adminScope.country)
      .neq("payment_status", "awaiting")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    res.json({ orders: scopeOrders(data, req.user.adminScope).slice(0, 500) });
  }),
);

app.patch(
  "/api/admin/orders/:id",
  auth,
  requireAdmin,
  ah(async (req, res) => {
    const status = String(req.body?.status || "");
    if (!STATUSES.includes(status))
      return res.status(400).json({ error: "Invalid status." });
    const { data: ord, error: e0 } = await db
      .from("orders")
      .select("id,email,status,customer,country,items")
      .eq("id", req.params.id)
      .eq("country", req.user.adminScope.country)
      .maybeSingle();
    if (e0) throw e0;
    // Doosre brand ka order (jaise water admin ke liye mithai order) edit nahi ho sakta
    if (!ord || !scopeOrder(ord, req.user.adminScope))
      return res.status(404).json({ error: "Order not found." });
    const { error } = await db
      .from("orders")
      .update({ status })
      .eq("id", req.params.id);
    if (error) throw error;
    if (ord.email && ord.status !== status)
      bg(
        sendMail(
          ord.email,
          `Order #${ord.id.slice(0, 8).toUpperCase()} is now ${status}`,
          wrapMail(
            "Order update",
            `<p>Hi ${esc(ord.customer?.name || "")}, your order <b>#${ord.id.slice(0, 8).toUpperCase()}</b> is now <b>${esc(status)}</b>.</p>`,
            ord.country === "PK" ? "Evelyn One" : "Mithai House",
          ),
        ),
      );
    res.json({ ok: true });
  }),
);

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// ---------- Serve built client (production) ----------
const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(dist)) {
  // Cache: /assets (hashed files) 1 saal, images/baqi 1 din, index.html hamesha taza
  app.use(
    express.static(dist, {
      setHeaders: (res, filePath) => {
        if (/[\\/]assets[\\/]/.test(filePath))
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        else if (filePath.endsWith(".html"))
          res.setHeader("Cache-Control", "no-cache");
        else
          res.setHeader(
            "Cache-Control",
            "public, max-age=86400, stale-while-revalidate=604800",
          );
      },
    }),
  );
  app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(dist, "index.html"));
  });
}

// Local / Render: `node server/index.js` se chalta hai. Vercel me api/index.js is app ko import karta hai.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(
      `Evelyn One + Mithai House server running on http://localhost:${PORT}`,
    ),
  );
}
module.exports = app;
