// Order / checkout / cart emails (customer ko details + admin ko copy).
// Sab emails ek hi Gmail se jati hain (SMTP_USER). Pakistan = "Evelyn One", USA = "Mithai House" naam ke sath.
// Test karne ke liye (server folder me):  node orderEmail.js customer@gmail.com PK
require("dotenv").config();
const nodemailer = require("nodemailer");

const BRANDS = {
  PK: { name: "Evelyn One", tagline: "Pure Drinking Water" },
  US: {
    name: "Mithai House",
    tagline: "Handcrafted Mithai",
    contact:
      "Shahid Mubasher · +1 (927) 937-8117 · shahidmahmood73@hotmail.com · 11 Tulsa St, Huntington, NY 11743, USA",
  },
};
const PAY_NAME = {
  cod: "Cash on delivery",
  stripe: "Card (Stripe)",
  paypal: "PayPal",
  bank: "Bank transfer (Citibank)",
};
const RED = "#D61F26";
const BLACK = "#0B0B0D";

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const short = (id) => String(id).slice(0, 8).toUpperCase();
const money = (n, cur) =>
  `${cur} ${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const validEmail = (e) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(
    String(e || "").trim(),
  );

/* ------------------------- Gmail SMTP ------------------------- */
const smtpUser = () =>
  String(process.env.SMTP_USER || "")
    .trim()
    .replace(/^"|"$/g, "");
// Gmail App Password aksar "abcd efgh ijkl mnop" (spaces ke sath) milta hai - spaces hata do
const smtpPass = () =>
  String(process.env.SMTP_PASS || "")
    .replace(/^"|"$/g, "")
    .replace(/\s+/g, "");

function notConfiguredReason() {
  const u = smtpUser();
  const p = smtpPass();
  if (!u || !p) return "server/.env me SMTP_USER ya SMTP_PASS khali hai.";
  if (/yourgmail|example\.com/i.test(u))
    return "SMTP_USER abhi placeholder (yourgmail@gmail.com) hai. Apna Gmail likhein.";
  if (/your-?16|app-?password/i.test(p))
    return "SMTP_PASS abhi placeholder hai. Gmail ka 16-character App Password likhein.";
  return "";
}

let transporter = null;
function getTransport() {
  if (notConfiguredReason()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user: smtpUser(), pass: smtpPass() },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
    });
  }
  return transporter;
}

// Server start par ek dafa: Gmail login theek hai ya nahi, console me bata deta hai
async function verify() {
  const why = notConfiguredReason();
  if (why) {
    console.warn(`\n[mail] EMAIL BAND HAI -> ${why}\n`);
    return false;
  }
  try {
    await getTransport().verify();
    console.log(
      `[mail] Gmail ready. Emails is address se jayengi: ${smtpUser()}`,
    );
    return true;
  } catch (e) {
    const bad =
      e.responseCode === 535 ||
      /Invalid login|Username and Password/i.test(e.message || "");
    console.warn(
      `\n[mail] Gmail login fail: ${e.message}\n` +
        (bad
          ? "[mail] App Password galat hai, ya Google account me 2-Step Verification on nahi hai.\n"
          : ""),
    );
    return false;
  }
}

async function deliver(msg) {
  const t = getTransport();
  if (!t) {
    console.warn(
      "[mail] skip (SMTP set nahi):",
      msg.subject,
      "-",
      notConfiguredReason(),
    );
    return false;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const info = await t.sendMail(msg);
      console.log(
        `[mail] sent -> ${[].concat(msg.to).join(", ")} | ${msg.subject} | ${info.response || ""}`,
      );
      return true;
    } catch (e) {
      console.error(
        `[mail] attempt ${attempt} failed (${[].concat(msg.to).join(", ")}): ${e.message}`,
      );
      if (attempt === 1) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}

/* ------------------------- Email content ------------------------- */
const thumb = (url) => {
  const u = String(url || "");
  if (!/^https:\/\//i.test(u)) return "";
  return /res\.cloudinary\.com/.test(u) && u.includes("/upload/")
    ? u.replace("/upload/", "/upload/w_120,h_120,c_fill,q_auto,f_jpg/")
    : u;
};

function siteLink(order) {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "";
  const base = String(process.env.CLIENT_URL || vercelUrl).replace(/\/$/, "");
  if (!base || /localhost|127\.0\.0\.1/i.test(base)) return "";
  return `${base}/order-placed/${order.id}`;
}

function when(order) {
  try {
    return new Date(order.created_at || Date.now()).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: order.country === "PK" ? "Asia/Karachi" : "America/New_York",
    });
  } catch {
    return "";
  }
}

function payLine(order) {
  if (order.payment_method === "cod")
    return "Cash on delivery (please pay when your order arrives)";
  const n = PAY_NAME[order.payment_method] || "Online payment";
  if (order.payment_method === "bank")
    return "Bank transfer (Citibank) - paid, payment receipt uploaded by the customer";
  return order.payment_status === "paid"
    ? `${n} - paid`
    : `${n} - awaiting payment`;
}

// Brand order ke products ke hisaab se: sirf mithai = Mithai House, sirf water = Evelyn One.
// Mix ya purana order (category save nahi) = country se.
const brandOf = (order) => {
  const cats = new Set(
    (Array.isArray(order.items) ? order.items : [])
      .map((i) => i.category)
      .filter(Boolean),
  );
  if (cats.size === 1) return cats.has("sweets") ? BRANDS.US : BRANDS.PK;
  return BRANDS[order.country] || BRANDS.US;
};

function buildOrderEmail(order, { admin = false } = {}) {
  const brand = brandOf(order);
  const c = order.customer || {};
  const cur = order.currency;
  const items = Array.isArray(order.items) ? order.items : [];
  const num = short(order.id);
  const addr = [c.address, [c.city, c.postal].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const link = siteLink(order);
  const qtyTotal = items.reduce((s, l) => s + (Number(l.qty) || 0), 0);

  const subject = admin
    ? `New order #${num} (${order.country}) - ${c.name || "customer"} - ${money(order.total, cur)}`
    : `Your ${brand.name} order #${num} is confirmed`;

  /* ---- HTML ---- */
  const rows = items
    .map((l) => {
      const img = thumb(l.image);
      return `<tr>
  <td width="64" style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top">${
    img
      ? `<img src="${esc(img)}" width="56" height="56" alt="${esc(l.name)}" style="display:block;border-radius:8px;object-fit:cover;border:1px solid #eee">`
      : ""
  }</td>
  <td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:top;font-size:14px;color:#222"><b>${esc(l.name)}</b>${l.unit ? `<br><span style="color:#777;font-size:12px">${esc(l.unit)}</span>` : ""}<br><span style="color:#777;font-size:12px">${l.qty} x ${money(l.price, cur)}</span></td>
  <td align="right" style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;font-size:14px;color:#222;white-space:nowrap">${money(l.price * l.qty, cur)}</td>
</tr>`;
    })
    .join("");

  const intro = admin
    ? `<p style="margin:0 0 14px;font-size:15px;color:#222">A new order has been placed on the website (${esc(order.country)}).</p>`
    : `<p style="margin:0 0 14px;font-size:15px;color:#222">Hi ${esc(c.name || "there")}, thank you for your order. Here are your order details for your records.</p>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f3f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f5;padding:20px 10px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
  <tr><td style="background:${BLACK};padding:22px;text-align:center">
    <div style="color:#ffffff;font-size:26px;letter-spacing:3px;font-weight:bold">${esc(brand.name.toUpperCase())}</div>
    <div style="color:${RED};font-size:12px;letter-spacing:2px;margin-top:4px">${esc(brand.tagline)}</div>
  </td></tr>
  <tr><td style="padding:24px">
    <h2 style="margin:0 0 6px;font-size:20px;color:${BLACK}">${admin ? "New order received" : "Order confirmed"}</h2>
    <p style="margin:0 0 16px;font-size:13px;color:#777">Order #${num}${when(order) ? ` &middot; ${esc(when(order))}` : ""}</p>
    ${intro}
    <h3 style="margin:18px 0 4px;font-size:14px;color:${RED};text-transform:uppercase;letter-spacing:1px">Your cart (${qtyTotal} item${qtyTotal === 1 ? "" : "s"})</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}
      <tr><td colspan="2" style="padding:14px 0 0;font-size:16px;color:${BLACK}"><b>Total</b></td><td align="right" style="padding:14px 0 0;font-size:16px;color:${BLACK};white-space:nowrap"><b>${money(order.total, cur)}</b></td></tr>
    </table>
    <h3 style="margin:24px 0 6px;font-size:14px;color:${RED};text-transform:uppercase;letter-spacing:1px">Delivery details</h3>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#222">
      ${esc(c.name)}<br>${esc(addr)}<br>Phone: ${esc(c.phone)}<br>Email: ${esc(c.email || order.email)}
    </p>
    ${c.notes ? `<p style="margin:10px 0 0;font-size:14px;color:#222"><b>Notes:</b> ${esc(c.notes)}</p>` : ""}
    <h3 style="margin:24px 0 6px;font-size:14px;color:${RED};text-transform:uppercase;letter-spacing:1px">Payment</h3>
    <p style="margin:0;font-size:14px;color:#222">${esc(payLine(order))}</p>
    ${
      order.receipt_url && /^https:\/\//i.test(order.receipt_url)
        ? `<p style="margin:8px 0 0;font-size:14px"><a href="${esc(order.receipt_url)}">View payment receipt</a></p>`
        : ""
    }
    ${
      link && !admin
        ? `<p style="margin:24px 0 0"><a href="${esc(link)}" style="background:${RED};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;display:inline-block">View your order</a></p>`
        : ""
    }
    ${
      admin
        ? ""
        : `<p style="margin:22px 0 0;font-size:13px;color:#555;line-height:1.5">We will email you again when your order status changes. If you have any question, just reply to this email.</p>`
    }
  </td></tr>
  <tr><td style="background:#f3f3f5;padding:14px;text-align:center;font-size:12px;color:#777">${esc(brand.name)} &middot; ${esc(brand.tagline)}${brand.contact ? `<br><span style="font-size:11px;color:#999">${esc(brand.contact)}</span>` : ""}</td></tr>
</table>
</td></tr></table>
</body></html>`;

  /* ---- Plain text (spam filters ko achha lagta hai) ---- */
  const text = [
    admin
      ? `NEW ORDER #${num} (${order.country})`
      : `${brand.name} - order confirmed`,
    `Order #${num}${when(order) ? " | " + when(order) : ""}`,
    "",
    admin ? "" : `Hi ${c.name || "there"}, thank you for your order.`,
    "",
    `YOUR CART (${qtyTotal} item${qtyTotal === 1 ? "" : "s"})`,
    ...items.map(
      (l) =>
        `- ${l.name}${l.unit ? " (" + l.unit + ")" : ""}: ${l.qty} x ${money(l.price, cur)} = ${money(l.price * l.qty, cur)}`,
    ),
    `TOTAL: ${money(order.total, cur)}`,
    "",
    "DELIVERY DETAILS",
    c.name,
    addr,
    `Phone: ${c.phone}`,
    `Email: ${c.email || order.email}`,
    c.notes ? `Notes: ${c.notes}` : "",
    "",
    `PAYMENT: ${payLine(order)}`,
    link && !admin ? `\nView your order: ${link}` : "",
    admin
      ? ""
      : "\nWe will email you again when your order status changes. Reply to this email if you have any question.",
    "",
    `${brand.name} - ${brand.tagline}`,
    ...(brand.contact ? [brand.contact] : []),
  ]
    .filter((l) => l !== undefined && l !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { subject, html, text, brand };
}

/* ------------------------- Public API ------------------------- */
// order = database ki orders row. admins = ADMIN_EMAILS ki list.
async function sendOrderMails(order, { admins = [] } = {}) {
  const from = smtpUser();
  const c = order.customer || {};

  // Customer: checkout form wali email + signup/signin wali account email (agar alag ho)
  const seen = new Set();
  const to = [order.email, c.email, c.account_email]
    .map((e) => String(e || "").trim())
    .filter(
      (e) =>
        validEmail(e) &&
        !seen.has(e.toLowerCase()) &&
        seen.add(e.toLowerCase()),
    );

  const results = [];
  if (to.length) {
    const m = buildOrderEmail(order);
    results.push(
      deliver({
        from: { name: m.brand.name, address: from },
        to,
        replyTo: from,
        subject: m.subject,
        text: m.text,
        html: m.html,
      }),
    );
  }

  const adminTo = admins.filter((a) => validEmail(a));
  if (adminTo.length) {
    const m = buildOrderEmail(order, { admin: true });
    results.push(
      deliver({
        from: { name: `${m.brand.name} Orders`, address: from },
        to: adminTo,
        replyTo: validEmail(order.email) ? order.email : from,
        subject: m.subject,
        text: m.text,
        html: m.html,
      }),
    );
  }
  return Promise.all(results);
}

module.exports = { sendOrderMails, buildOrderEmail, verify };

/* ------------------------- Quick test -------------------------
   server folder me:   node orderEmail.js customer@gmail.com PK
   (PK = Evelyn One water email, US = Mithai House mithai email)                */
if (require.main === module) {
  (async () => {
    const to = process.argv[2];
    const country =
      String(process.argv[3] || "PK").toUpperCase() === "US" ? "US" : "PK";
    if (!validEmail(to)) {
      console.log("Use: node orderEmail.js customer@gmail.com PK");
      process.exit(1);
    }
    await verify();
    const pk = country === "PK";
    const order = {
      id: "3f2a9c1e-0000-4000-8000-000000000000",
      email: to,
      country,
      currency: pk ? "PKR" : "USD",
      total: pk ? 2200 : 48,
      payment_method: "cod",
      payment_status: "unpaid",
      created_at: new Date().toISOString(),
      items: pk
        ? [
            {
              name: "Evelyn One 19 L",
              unit: "19 L bottle",
              qty: 2,
              price: 600,
            },
            {
              name: "Evelyn One 1.5 L",
              unit: "Pack of 6",
              qty: 2,
              price: 500,
            },
          ]
        : [
            { name: "Kaju Katli", unit: "1 lb box", qty: 2, price: 18 },
            { name: "Gulab Jamun", unit: "12 pieces", qty: 1, price: 12 },
          ],
      customer: {
        name: "Test Customer",
        phone: "+92 300 1234567",
        email: to,
        address: "House 1, Street 2",
        city: "Faisalabad",
        postal: "38000",
        notes: "",
      },
    };
    await sendOrderMails(order, { admins: [] });
    setTimeout(() => process.exit(0), 500);
  })();
}
