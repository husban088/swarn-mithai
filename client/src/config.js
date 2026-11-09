// Brand + country settings. Yahan se phone/email/address badal sakte hain.
export const BRAND = {
  name: "Mithai House",
  email: "hello@mithaihouse.example",
};

// Country ke hisaab se brand: Pakistan = Evelyn One (water), USA = Mithai House (mithai).
// Naam / tagline / email yahin se badal sakte hain.
export const BRANDS = {
  PK: {
    key: "evelynone",
    name: "Evelyn One",
    letter: "E",
    drop: true,
    logo: "/brand/evelyn-one.svg",
    logoLight: "/brand/evelyn-one-light.svg", // dark background wala (transparent) version
    logoCompact: "/brand/evelyn-one-compact.svg", // Navbar / sidebar (tagline ke bina)
    logoCompactLight: "/brand/evelyn-one-compact-light.svg",
    mark: "/brand/evelyn-one-mark.svg", // sirf gol emblem (cards, admin)
    tagline: "Pure Drinking Water",
    email: "wjahattahir@gmail.com",
    blurb: "Purified water, tested and sealed fresh.",
  },
  US: {
    key: "mithaihouse",
    name: "Mithai House",
    letter: "M",
    drop: false,
    logo: "/brand/mithai-house.png", // safed background par (kala logo, transparent)
    logoLight: "/brand/mithai-house-light.png", // dark / blue background par (safed logo, transparent)
    tagline: "Handcrafted Mithai",
    email: "shahidmahmood73@hotmail.com",
    owner: "Shahid Mubasher",
    blurb: "Made in small batches with pure ghee, real khoya and patience.",
  },
};
export const brandFor = (code) => BRANDS[code] || BRANDS.US;

export const COUNTRIES = {
  PK: {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    currency: "PKR",
    locale: "en-PK",
    categories: ["sweets", "aqua"],
    tagline: "Pure Drinking Water",
    bar: "Cash on delivery across Pakistan · Evelyn One pure drinking water",
    phone: "+92 304 5157004",
    phone2: "+92 302 8213652",
    city: "Faisalabad, Pakistan",
  },
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    locale: "en-US",
    categories: ["sweets"],
    tagline: "Handcrafted Mithai",
    bar: "Fresh Pakistani mithai · Pay on delivery · USD pricing",
    phone: "+1 (927) 937-8117",
    // Poora address (Footer, Contact, side menu aur invoice me yahi dikhta hai)
    city: "11 Tulsa St, Huntington, NY 11743, USA",
    owner: "Shahid Mubasher",
  },
};

export const CATEGORIES = {
  sweets: {
    key: "sweets",
    label: "Mithai",
    blurb: "Hand-rolled, ghee-rich sweets made fresh in small batches.",
    icon: "🍯",
  },
  aqua: {
    key: "aqua",
    label: "Evelyn One",
    blurb: "Evelyn One purified drinking water in bottles for home and office.",
    icon: "💧",
  },
};

export const money = (n, c) =>
  new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.currency,
    maximumFractionDigits: c.currency === "PKR" ? 0 : 2,
  }).format(n);

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
export const STATUS_STYLE = {
  pending: "bg-slate-100 text-slate-700",
  processing: "bg-gold-100 text-gold-700",
  shipped: "bg-champ-100 text-champ-600",
  delivered: "bg-royal text-white",
  cancelled: "bg-red-50 text-red-700",
};

export const PAYMENT_LABELS = {
  cod: "Cash on delivery",
  stripe: "Card (Stripe)",
  paypal: "PayPal",
  bank: "Bank transfer (Citibank)",
};
export const PAYMENT_STATUS_LABELS = {
  unpaid: "Pay on delivery",
  awaiting: "Awaiting payment",
  paid: "Paid",
};

// ---- Alag alag link (Vercel project) har country ke liye ----
// Vercel me VITE_SITE_COUNTRY=PK  -> ye link hamesha sirf Pakistan (Evelyn One, PKR)
// Vercel me VITE_SITE_COUNTRY=US  -> ye link hamesha sirf USA (Mithai House, USD)
// Khali chhorein to purana tareeqa: visitor ki country khud pehchani jati hai.
const _site = String(import.meta.env.VITE_SITE_COUNTRY || "")
  .trim()
  .toUpperCase();
export const SITE_COUNTRY = COUNTRIES[_site] ? _site : "";

// Sirf in emails ko navbar me country dropdown (Pakistan / USA) dikhta hai.
// Jo country chuno, poori website usi country ki ban jati hai.
export const COUNTRY_SWITCH_EMAILS = ["wjahattahir@gmail.com"];

// Mithai House (USA) bank transfer. Number / naam yahin se badal sakte hain.
export const BANK = {
  bank: "Citibank",
  account: "9997315696",
  holder: "Shahid Mubasher",
  // WhatsApp number (sirf digits, country code ke saath): receipt yahan bhejni hai
  whatsapp: "19279378117",
  whatsappLabel: "+1 (927) 937-8117",
};

// Online payments (Stripe / PayPal) abhi band hain. Baad me chalu karne ke liye true karein
// (aur server/.env me ONLINE_PAYMENTS=true bhi set karein).
export const ONLINE_PAYMENTS = false;

// Delivery + event details (website par jahan bhi dikhte hain, sab yahin se aate hain)
export const SHOP_INFO = {
  delivery: {
    title: "Second-day delivery",
    short: "2nd-day delivery",
    note: "Delivery time depends on your state.",
  },
  special: {
    title: "Special rates for events",
    text: "Weddings, birthdays and baby-born celebrations get special rates with special boxes.",
    occasions: ["Weddings", "Birthdays", "Baby Born"],
    box: { name: "Special Box", price: 20, pieces: 16 },
  },
  // Har mithai ke 2 box options (USD). Card par image ke neeche chips: jo chuno uski image + price dikhti hai.
  // Naya mithai product add karte waqt Admin form me ye dono khud bhar jate hain.
  boxes: [
    {
      key: "signature",
      label: "Signature Box",
      price_usd: 12,
      note: "Fresh handcrafted box",
    },
    {
      key: "special-box",
      label: "Special Box",
      price_usd: 20,
      note: "Gift-ready · 16 pcs",
    },
  ],
};

// Special Box ki image upload na ho to ye default image dikhti hai (client/public/boxes/special-box.svg)
export const SPECIAL_BOX_KEY = "special-box";
export const SPECIAL_BOX_IMAGE = "/boxes/special-box.svg";

// 20 varieties (names bilkul products ke names jaise hone chahiye, taake search link kaam kare)
export const VARIETIES = [
  "Khoya Barfi",
  "Almond Barfi",
  "Pistachio Barfi",
  "Mango Barfi",
  "Chocolate Barfi",
  "Coffee Barfi",
  "Orange Barfi",
  "Besan Barfi",
  "Kaju Katli",
  "Gulab Jamun",
  "Laddu",
  "Kalakand",
  "Pink Kalakand",
  "Milk Cake",
  "Habshi Halwa",
  "Khoya Pera",
  "Gajar Halwa",
  "Coconut Barfi",
  "Pateesa",
  "Pineapple Barfi",
];
