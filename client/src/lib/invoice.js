// Luxury invoice PDF (owner ke liye) — jsPDF se browser me hi banta hai, server ki zarurat nahi.
import { jsPDF } from "jspdf";
import {
  BRANDS,
  COUNTRIES,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../config";

// ---------- palette ----------
// Site ki theme: black + blue + white (USA Best Mithai aur Pakistan Evelyn One dono invoices me yehi)
const BLACK = [11, 11, 13];
const BLACK_DEEP = [4, 4, 5];
const BLUE = [29, 127, 224]; // site ka water blue
const BLUE_SOFT = [232, 242, 253];
const BLUE_DEEP = [10, 58, 120]; // gehra blue (paid stamp)
const INK = [27, 27, 27];
const MUTED = [110, 110, 118];
const LINE = [228, 228, 232];
const ZEBRA = [248, 248, 249];

const PAGE_W = 210;
const PAGE_H = 297;
const M = 14; // margin

// Standard PDF fonts sirf Latin support karte hain — baqi characters '?' ban jate hain
const clean = (v) =>
  String(v ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00d7/g, "x")
    .replace(/[\u00b7\u2022]/g, "-")
    .replace(/[^\x20-\x7e]/g, "?")
    .trim();

const money = (n, cur) => {
  const v = Number(n) || 0;
  if (cur === "PKR") return "Rs " + Math.round(v).toLocaleString("en-US");
  return (
    "$" +
    v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const pad = (n) => String(n).padStart(2, "0");

export const invoiceNo = (o) =>
  "INV-" +
  String(o.id || "")
    .slice(0, 8)
    .toUpperCase();

function dateParts(d) {
  const x = new Date(d);
  if (isNaN(x))
    return {
      day: "-",
      month: "-",
      year: "-",
      full: "-",
      time: "-",
      weekday: "-",
    };
  let h = x.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return {
    day: pad(x.getDate()),
    month: MONTHS[x.getMonth()],
    year: String(x.getFullYear()),
    weekday: DAYS[x.getDay()],
    full: `${pad(x.getDate())} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`,
    time: `${pad(h)}:${pad(x.getMinutes())} ${ap}`,
  };
}

const fill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const stroke = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);
const color = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);

function spaced(doc, text, x, y, space = 1.2, opts = {}) {
  // letter-spaced text (luxury look). Align ko hum khud nikalte hain taake spacing ke saath bhi sahi baithe.
  const w = doc.getTextWidth(text) + space * text.length;
  let px = x;
  if (opts.align === "right") px = x - w + space;
  else if (opts.align === "center") px = x - w / 2 + space / 2;
  doc.setCharSpace(space);
  doc.text(text, px, y);
  doc.setCharSpace(0);
}

const spacedWidth = (doc, text, space) =>
  doc.getTextWidth(text) + space * text.length;

function drawHeader(doc, brand, order, first) {
  // navy band
  fill(doc, BLACK);
  doc.rect(0, 0, PAGE_W, first ? 58 : 22, "F");
  fill(doc, BLUE);
  doc.rect(0, first ? 58 : 22, PAGE_W, 1.4, "F");

  // monogram circle
  const cy = first ? 29 : 11;
  const r = first ? 11 : 6.5;
  stroke(doc, BLUE);
  doc.setLineWidth(0.7);
  doc.circle(M + r, cy, r, "S");
  doc.setLineWidth(0.25);
  doc.circle(M + r, cy, r - 1.4, "S");
  doc.setFont("times", "bold");
  doc.setFontSize(first ? 20 : 12);
  color(doc, BLUE);
  doc.text(brand.letter, M + r, cy + (first ? 2.4 : 1.4), { align: "center" });

  if (first) {
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    color(doc, [255, 255, 255]);
    spaced(doc, clean(brand.name).toUpperCase(), M + 28, 27, 1.6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    color(doc, BLUE);
    spaced(doc, clean(brand.tagline).toUpperCase(), M + 28, 34, 1.4);

    doc.setFont("times", "bold");
    doc.setFontSize(30);
    color(doc, BLUE);
    spaced(doc, "INVOICE", PAGE_W - M, 28, 2.2, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(doc, [225, 225, 230]);
    doc.text(invoiceNo(order), PAGE_W - M, 36, { align: "right" });
  } else {
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    color(doc, [255, 255, 255]);
    spaced(doc, clean(brand.name).toUpperCase(), M + 17, 12.5, 1.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    color(doc, BLUE);
    doc.text(`INVOICE  ${invoiceNo(order)}  (continued)`, PAGE_W - M, 12.5, {
      align: "right",
    });
  }
}

function drawFooter(doc, brand, country, page, pages) {
  const info = COUNTRIES[country] || COUNTRIES.US;
  stroke(doc, BLUE);
  doc.setLineWidth(0.5);
  doc.line(M, PAGE_H - 22, PAGE_W - M, PAGE_H - 22);
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  color(doc, BLACK);
  doc.text(
    "Thank you for choosing " + clean(brand.name) + ".",
    PAGE_W / 2,
    PAGE_H - 15.5,
    {
      align: "center",
    },
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  color(doc, MUTED);
  doc.text(
    clean(
      `${info.owner ? info.owner + "   |   " : ""}${brand.email}   |   ${info.phone}${info.phone2 ? "  /  " + info.phone2 : ""}`,
    ),
    PAGE_W / 2,
    PAGE_H - 11.5,
    { align: "center" },
  );
  doc.text(clean(info.city), PAGE_W / 2, PAGE_H - 8.5, { align: "center" });
  doc.setFontSize(7);
  doc.text("This is a computer generated invoice.", M, PAGE_H - 4.5);
  doc.text(`Page ${page} of ${pages}`, PAGE_W - M, PAGE_H - 4.5, {
    align: "right",
  });
  fill(doc, BLACK);
  doc.rect(0, PAGE_H - 2.2, PAGE_W, 2.2, "F");
}

function label(doc, text, x, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  color(doc, BLUE);
  spaced(doc, text.toUpperCase(), x, y, 1);
}

function kv(doc, k, v, x, y, w) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  color(doc, MUTED);
  doc.text(k, x, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  color(doc, INK);
  const lines = doc.splitTextToSize(clean(v) || "-", w);
  doc.text(lines, x + 27, y);
  return Math.max(1, lines.length) * 4.4;
}

// Order kis brand ka hai: sirf mithai (sweets) = "US" (Best Mithai), sirf water (aqua) = "PK" (Evelyn One).
// Mix order = country se.
// Purane orders me item ki category save nahi hoti thi (Pakistan ka mithai order bhi Evelyn One ban jata tha),
// isliye category na ho to item ke naam se pehchante hain: water ke lafz = aqua, baqi sab mithai.
const AQUA_WORDS =
  /\b(water|pani|aqua|bottle|bottles|jar|refill|dispenser|litre|liter|ltr|mineral|apna|evelyn)\b|\b\d+(\.\d+)?\s?(l|ml|ltr)\b/i;
const itemCategory = (it) => {
  if (it?.category === "sweets" || it?.category === "aqua") return it.category;
  return AQUA_WORDS.test(String(it?.name || "")) ? "aqua" : "sweets";
};

export const brandKeyOf = (order) => {
  const cats = new Set(
    (Array.isArray(order?.items) ? order.items : []).map(itemCategory),
  );
  if (cats.size === 1) return cats.has("sweets") ? "US" : "PK";
  return order?.country === "PK" ? "PK" : "US";
};

// ---------- main ----------
// Ek order ki invoice doc ke current (khali) page se shuru karke likhta hai
function renderInvoice(doc, order) {
  const startPage = doc.getNumberOfPages();
  const country = order.country === "PK" ? "PK" : "US";
  // Brand / contact details order ke products ke hisaab se: sirf mithai = Best Mithai, sirf water = Evelyn One
  const brandKey = brandKeyOf(order);
  const brand = BRANDS[brandKey] || BRANDS.US;
  const cur = order.currency === "PKR" ? "PKR" : "USD";
  const c = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const dp = dateParts(order.created_at);
  const status =
    order.status === "confirmed" ? "processing" : order.status || "pending";

  drawHeader(doc, brand, order, true);

  // ---------- date strip ----------
  let y = 68;
  const cells = [
    ["ORDER DATE", dp.full],
    ["DAY", `${dp.weekday}`],
    ["MONTH", dp.month],
    ["YEAR", dp.year],
    ["TIME", dp.time],
  ];
  const cw = (PAGE_W - 2 * M) / cells.length;
  fill(doc, BLUE_SOFT);
  doc.roundedRect(M, y, PAGE_W - 2 * M, 17, 2, 2, "F");
  cells.forEach(([k, v], i) => {
    const x = M + i * cw + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    color(doc, BLUE);
    spaced(doc, k, x, y + 6.2, 1);
    doc.setFont("times", "bold");
    doc.setFontSize(i === 0 ? 11 : 12);
    color(doc, BLACK);
    doc.text(clean(v), x, y + 12.8);
    if (i > 0) {
      stroke(doc, LINE);
      doc.setLineWidth(0.3);
      doc.line(M + i * cw, y + 3.5, M + i * cw, y + 13.5);
    }
  });

  // ---------- customer + order cards ----------
  y += 25;
  const cardW = (PAGE_W - 2 * M - 6) / 2;
  const cardH = 52;
  [0, 1].forEach((i) => {
    const x = M + i * (cardW + 6);
    stroke(doc, LINE);
    doc.setLineWidth(0.4);
    fill(doc, [255, 255, 255]);
    doc.roundedRect(x, y, cardW, cardH, 2.5, 2.5, "FD");
    fill(doc, BLUE);
    doc.rect(x, y + 4, 1.2, 9, "F");
  });

  // left: customer / checkout
  let lx = M + 6;
  label(doc, "Billed to / Checkout details", lx, y + 9.5);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  color(doc, BLACK);
  doc.text(clean(c.name) || "Customer", lx, y + 18);
  let ly = y + 24.5;
  ly += kv(doc, "Email", order.email || c.email || "-", lx, ly, cardW - 38);
  ly += kv(doc, "Phone", c.phone, lx, ly, cardW - 38);
  ly += kv(
    doc,
    "Address",
    [c.address, c.city, c.postal].filter(Boolean).join(", "),
    lx,
    ly,
    cardW - 38,
  );
  kv(
    doc,
    "Account",
    c.guest ? "Guest checkout" : "Registered customer",
    lx,
    ly,
    cardW - 38,
  );

  // right: order & payment
  let rx = M + cardW + 6 + 6;
  label(doc, "Order & payment", rx, y + 9.5);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  color(doc, BLACK);
  doc.text(
    "#" +
      String(order.id || "")
        .slice(0, 8)
        .toUpperCase(),
    rx,
    y + 18,
  );
  let ry = y + 24.5;
  ry += kv(doc, "Status", status.toUpperCase(), rx, ry, cardW - 38);
  ry += kv(
    doc,
    "Payment",
    PAYMENT_LABELS[order.payment_method] || "Cash on delivery",
    rx,
    ry,
    cardW - 38,
  );
  ry += kv(
    doc,
    "Pay status",
    PAYMENT_STATUS_LABELS[order.payment_status] || "Pay on delivery",
    rx,
    ry,
    cardW - 38,
  );
  kv(
    doc,
    "Market",
    `${country === "PK" ? "Pakistan" : "United States"} (${cur})`,
    rx,
    ry,
    cardW - 38,
  );

  // ---------- items table ----------
  y += cardH + 9;
  const cols = {
    n: M + 3,
    name: M + 12,
    unit: M + 92,
    qty: M + 128,
    price: PAGE_W - M - 34,
    amt: PAGE_W - M - 3,
  };

  const tableHead = (yy) => {
    label(doc, "Cart items", M, yy);
    yy += 3;
    fill(doc, BLACK);
    doc.roundedRect(M, yy, PAGE_W - 2 * M, 9, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    color(doc, BLUE);
    spaced(doc, "#", cols.n, yy + 5.8, 0.8);
    spaced(doc, "ITEM", cols.name, yy + 5.8, 0.8);
    spaced(doc, "PACK / UNIT", cols.unit, yy + 5.8, 0.8);
    spaced(doc, "QTY", cols.qty, yy + 5.8, 0.8, { align: "center" });
    spaced(doc, "PRICE", cols.price, yy + 5.8, 0.8, { align: "right" });
    spaced(doc, "AMOUNT", cols.amt, yy + 5.8, 0.8, { align: "right" });
    return yy + 9;
  };

  y = tableHead(y);
  let subtotal = 0;
  let units = 0;
  items.forEach((it, idx) => {
    const qty = Number(it.qty) || 0;
    const price = Number(it.price) || 0;
    const line = qty * price;
    subtotal += line;
    units += qty;
    const nameLines = doc.splitTextToSize(clean(it.name) || "Item", 76);
    const rowH = Math.max(10, nameLines.length * 4.6 + 5);

    if (y + rowH > PAGE_H - 70) {
      doc.addPage();
      drawHeader(doc, brand, order, false);
      y = tableHead(32);
    }
    if (idx % 2 === 0) {
      fill(doc, ZEBRA);
      doc.rect(M, y, PAGE_W - 2 * M, rowH, "F");
    }
    const ty = y + 6.3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    color(doc, MUTED);
    doc.text(String(idx + 1), cols.n, ty);
    doc.setFont("helvetica", "bold");
    color(doc, INK);
    doc.text(nameLines, cols.name, ty);
    doc.setFont("helvetica", "normal");
    color(doc, MUTED);
    doc.text(clean(it.unit) || "-", cols.unit, ty);
    color(doc, INK);
    doc.setFont("helvetica", "bold");
    doc.text(String(qty), cols.qty, ty, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(money(price, cur), cols.price, ty, { align: "right" });
    doc.setFont("helvetica", "bold");
    color(doc, BLACK);
    doc.text(money(line, cur), cols.amt, ty, { align: "right" });
    stroke(doc, LINE);
    doc.setLineWidth(0.2);
    doc.line(M, y + rowH, PAGE_W - M, y + rowH);
    y += rowH;
  });
  if (!items.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    color(doc, MUTED);
    doc.text("No items recorded for this order.", M + 3, y + 8);
    y += 12;
  }

  // ---------- notes + totals ----------
  y += 8;
  if (y > PAGE_H - 78) {
    doc.addPage();
    drawHeader(doc, brand, order, false);
    y = 34;
  }
  const boxTop = y;

  // delivery info (left)
  const noteW = 92;
  label(doc, "Delivery", M, boxTop + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  color(doc, INK);
  doc.text(
    doc.splitTextToSize(
      "We will call you on the phone number above to confirm your delivery.",
      noteW,
    ),
    M,
    boxTop + 10,
  );

  // totals (right)
  const tx = PAGE_W - M - 78;
  const total = Number(order.total) || subtotal;
  const rows = [
    ["Items in cart", String(items.length)],
    ["Total units", String(units)],
    ["Subtotal", money(subtotal, cur)],
  ];
  let ty = boxTop + 4;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(doc, MUTED);
    doc.text(k, tx, ty);
    doc.setFont("helvetica", "bold");
    color(doc, INK);
    doc.text(v, PAGE_W - M, ty, { align: "right" });
    stroke(doc, LINE);
    doc.setLineWidth(0.2);
    doc.line(tx, ty + 2.4, PAGE_W - M, ty + 2.4);
    ty += 7;
  });
  ty += 1;
  fill(doc, BLACK_DEEP);
  doc.roundedRect(tx, ty, 78, 15, 2, 2, "F");
  stroke(doc, BLUE);
  doc.setLineWidth(0.5);
  doc.roundedRect(tx + 0.9, ty + 0.9, 76.2, 13.2, 1.6, 1.6, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  color(doc, BLUE);
  spaced(doc, "GRAND TOTAL", tx + 5, ty + 9, 1.2);
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  color(doc, [255, 255, 255]);
  doc.text(money(total, cur), PAGE_W - M - 5, ty + 9.6, { align: "right" });

  // paid / unpaid stamp
  const paid = order.payment_status === "paid";
  const stampY = ty + 26;
  if (stampY < PAGE_H - 36) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const txt = paid ? "PAID IN FULL" : "PAYMENT DUE ON DELIVERY";
    const w = spacedWidth(doc, txt, 0.8) + 12;
    stroke(doc, paid ? BLUE_DEEP : BLUE);
    doc.setLineWidth(0.7);
    doc.roundedRect(PAGE_W - M - w, stampY - 6, w, 10, 2, 2, "S");
    color(doc, paid ? BLUE_DEEP : BLUE);
    spaced(doc, txt, PAGE_W - M - w / 2, stampY + 0.4, 0.8, {
      align: "center",
    });
  }

  // footer + page numbers on every page
  const endPage = doc.getNumberOfPages();
  const count = endPage - startPage + 1;
  for (let p = startPage; p <= endPage; p++) {
    doc.setPage(p);
    drawFooter(doc, brand, brandKey, p - startPage + 1, count);
  }
  doc.setPage(endPage);
}

export function buildInvoice(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  renderInvoice(doc, order);
  return doc;
}

export function downloadInvoice(order) {
  const doc = buildInvoice(order);
  doc.save(`${invoiceNo(order)}.pdf`);
}

// =====================================================================
//  BULK: din / mahina / saal / date-range ki saari invoices ek saath
// =====================================================================
const tick = () => new Promise((r) => setTimeout(r, 0));
const slug = (t) =>
  clean(t)
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "all";
const byDateAsc = (a, b) => new Date(a.created_at) - new Date(b.created_at);

function coverHeader(doc, first, period, brandName = "BEST MITHAI & EVELYN ONE", letter = "B") {
  fill(doc, BLACK);
  doc.rect(0, 0, PAGE_W, first ? 58 : 22, "F");
  fill(doc, BLUE);
  doc.rect(0, first ? 58 : 22, PAGE_W, 1.4, "F");
  const cy = first ? 29 : 11;
  const r = first ? 11 : 6.5;
  stroke(doc, BLUE);
  doc.setLineWidth(0.7);
  doc.circle(M + r, cy, r, "S");
  doc.setLineWidth(0.25);
  doc.circle(M + r, cy, r - 1.4, "S");
  doc.setFont("times", "bold");
  doc.setFontSize(first ? 20 : 12);
  color(doc, BLUE);
  doc.text(letter, M + r, cy + (first ? 2.4 : 1.4), { align: "center" });
  if (first) {
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    color(doc, [255, 255, 255]);
    spaced(doc, brandName, M + 28, 27, 1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    color(doc, BLUE);
    spaced(doc, "INVOICE BUNDLE", M + 28, 34, 1.4);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    color(doc, BLUE);
    spaced(doc, "STATEMENT", PAGE_W - M, 27, 1.2, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(doc, [225, 225, 230]);
    doc.text(clean(period), PAGE_W - M, 35, { align: "right" });
  } else {
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    color(doc, [255, 255, 255]);
    spaced(doc, "SALES STATEMENT", M + 17, 12.5, 1.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    color(doc, BLUE);
    doc.text(clean(period) + "  (continued)", PAGE_W - M, 12.5, {
      align: "right",
    });
  }
}

// Cover par brand: sab orders Best Mithai ke = Best Mithai, sab Evelyn One ke = Evelyn One, mix = dono
function coverBrand(orders) {
  const keys = new Set(orders.map(brandKeyOf));
  if (keys.size === 1) {
    const b = BRANDS[[...keys][0]] || BRANDS.US;
    return [clean(b.name).toUpperCase(), b.letter];
  }
  return ["BEST MITHAI & EVELYN ONE", "B"];
}

function drawCover(doc, orders, period) {
  const start = doc.getNumberOfPages();
  coverHeader(doc, true, period, ...coverBrand(orders));

  let units = 0;
  const tot = { PKR: 0, USD: 0 };
  orders.forEach((o) => {
    tot[o.currency === "PKR" ? "PKR" : "USD"] += Number(o.total) || 0;
    (Array.isArray(o.items) ? o.items : []).forEach(
      (i) => (units += Number(i.qty) || 0),
    );
  });

  let y = 68;
  const stats = [
    ["INVOICES", String(orders.length)],
    ["UNITS SOLD", String(units)],
    ["SALES - PAKISTAN", money(tot.PKR, "PKR")],
    ["SALES - USA", money(tot.USD, "USD")],
  ];
  const cw = (PAGE_W - 2 * M) / stats.length;
  fill(doc, BLUE_SOFT);
  doc.roundedRect(M, y, PAGE_W - 2 * M, 19, 2, 2, "F");
  stats.forEach(([k, v], i) => {
    const x = M + i * cw + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    color(doc, BLUE);
    spaced(doc, k, x, y + 6.5, 1);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    color(doc, BLACK);
    doc.text(clean(v), x, y + 14);
    if (i > 0) {
      stroke(doc, LINE);
      doc.setLineWidth(0.3);
      doc.line(M + i * cw, y + 4, M + i * cw, y + 15);
    }
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  color(doc, MUTED);
  const now = new Date();
  doc.text(
    `Generated on ${dateParts(now).full}, ${dateParts(now).time}`,
    M,
    y + 26,
  );

  const col = {
    inv: M + 3,
    date: M + 36,
    cust: M + 70,
    st: M + 128,
    tot: PAGE_W - M - 3,
  };
  const head = (yy) => {
    label(doc, "Included invoices", M, yy);
    yy += 3;
    fill(doc, BLACK);
    doc.roundedRect(M, yy, PAGE_W - 2 * M, 9, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    color(doc, BLUE);
    spaced(doc, "INVOICE", col.inv, yy + 5.8, 0.8);
    spaced(doc, "DATE", col.date, yy + 5.8, 0.8);
    spaced(doc, "CUSTOMER", col.cust, yy + 5.8, 0.8);
    spaced(doc, "STATUS", col.st, yy + 5.8, 0.8);
    spaced(doc, "TOTAL", col.tot, yy + 5.8, 0.8, { align: "right" });
    return yy + 9;
  };

  y = head(y + 34);
  orders.forEach((o, idx) => {
    if (y + 8 > PAGE_H - 28) {
      doc.addPage();
      coverHeader(doc, false, period, ...coverBrand(orders));
      y = head(32);
    }
    if (idx % 2 === 0) {
      fill(doc, ZEBRA);
      doc.rect(M, y, PAGE_W - 2 * M, 8, "F");
    }
    const ty = y + 5.3;
    const st = o.status === "confirmed" ? "processing" : o.status || "pending";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    color(doc, BLACK);
    doc.text(invoiceNo(o), col.inv, ty);
    doc.setFont("helvetica", "normal");
    color(doc, MUTED);
    doc.text(dateParts(o.created_at).full, col.date, ty);
    color(doc, INK);
    doc.text(clean((o.customer || {}).name).slice(0, 30) || "-", col.cust, ty);
    color(doc, MUTED);
    doc.text(clean(st).toUpperCase(), col.st, ty);
    doc.setFont("helvetica", "bold");
    color(doc, BLACK);
    doc.text(
      money(o.total, o.currency === "PKR" ? "PKR" : "USD"),
      col.tot,
      ty,
      {
        align: "right",
      },
    );
    y += 8;
  });

  const end = doc.getNumberOfPages();
  for (let p = start; p <= end; p++) {
    doc.setPage(p);
    stroke(doc, BLUE);
    doc.setLineWidth(0.5);
    doc.line(M, PAGE_H - 22, PAGE_W - M, PAGE_H - 22);
    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    color(doc, BLACK);
    doc.text(
      "Every invoice in this statement follows on its own pages.",
      PAGE_W / 2,
      PAGE_H - 14,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    color(doc, MUTED);
    doc.text("This is a computer generated statement.", M, PAGE_H - 5.5);
    doc.text(
      `Summary page ${p - start + 1} of ${end - start + 1}`,
      PAGE_W - M,
      PAGE_H - 5.5,
      {
        align: "right",
      },
    );
    fill(doc, BLACK);
    doc.rect(0, PAGE_H - 2.2, PAGE_W, 2.2, "F");
  }
  doc.setPage(end);
}

// Saari orders ki invoices ek hi PDF me (pehle summary page, phir har order ki invoice)
export async function downloadBulkInvoices(
  orders,
  { period = "All time", onProgress } = {},
) {
  const list = [...orders].sort(byDateAsc);
  if (!list.length) throw new Error("Is filter me koi order nahi hai.");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  drawCover(doc, list, period);
  for (let i = 0; i < list.length; i++) {
    doc.addPage();
    renderInvoice(doc, list[i]);
    if (i % 10 === 9) {
      onProgress && onProgress(i + 1, list.length);
      await tick();
    }
  }
  onProgress && onProgress(list.length, list.length);
  doc.save(`Invoices-${slug(period)}.pdf`);
  return list.length;
}

// Har order ki alag PDF, sab ek ZIP me
export async function downloadInvoicesZip(
  orders,
  { period = "All time", onProgress } = {},
) {
  const list = [...orders].sort(byDateAsc);
  if (!list.length) throw new Error("Is filter me koi order nahi hai.");
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    const d = new Date(o.created_at);
    const day = isNaN(d)
      ? "0000-00-00"
      : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    zip.file(
      `${day}_${invoiceNo(o)}.pdf`,
      buildInvoice(o).output("arraybuffer"),
    );
    if (i % 5 === 4) {
      onProgress && onProgress(i + 1, list.length);
      await tick();
    }
  }
  onProgress && onProgress(list.length, list.length);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoices-${slug(period)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return list.length;
}