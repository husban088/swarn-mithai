// Website ka text content. Yahan apni real information likh do (stats, testimonials, services).
// NOTE: Numbers aur testimonials sample hain, apni real details se replace kar lena.

export const STATS = [
  { value: 10, suffix: "+", label: "Years of craft" },
  { value: 5000, suffix: "+", label: "Happy customers" },
  { value: 25, suffix: "+", label: "Signature sweets" },
  { value: 100, suffix: "%", label: "Pure desi ghee" },
];

export const WHY = [
  {
    icon: "Flame",
    title: "Made fresh, shipped same day",
    text: "Every batch is cooked the day it ships. No warehouse shelves, no stale boxes.",
  },
  {
    icon: "Gem",
    title: "Pure ingredients only",
    text: "Desi ghee, real khoya, whole nuts and saffron. Nothing artificial, ever.",
  },
  {
    icon: "HandHeart",
    title: "Rolled by hand",
    text: "Small batches, shaped by experienced hands the way our elders taught us.",
  },
  {
    icon: "ShieldCheck",
    title: "Quality checked",
    text: "Each box is inspected and sealed so it reaches you looking as good as it tastes.",
  },
  {
    icon: "Truck",
    title: "Pay on delivery",
    text: "Order without an account and pay only when your box arrives at your door.",
  },
  {
    icon: "Gift",
    title: "Made for gifting",
    text: "Elegant packaging for weddings, Eid, Diwali-style celebrations and corporate gifts.",
  },
];

export const SERVICES = [
  {
    icon: "Gift",
    title: "Gift boxes",
    text: "Curated mithai boxes in premium packaging, ready to gift for any occasion.",
  },
  {
    icon: "PartyPopper",
    title: "Weddings & events",
    text: "Large orders for nikah, mehndi, walima and family functions, made to your schedule.",
  },
  {
    icon: "Building2",
    title: "Corporate gifting",
    text: "Branded gift hampers for clients, teams and festive seasons.",
  },
  {
    icon: "Package",
    title: "Bulk orders",
    text: "Special pricing and planning support when you order in larger quantities.",
  },
  {
    icon: "Truck",
    title: "Doorstep delivery",
    text: "Careful, quick delivery with pay on delivery. No account needed.",
  },
  {
    icon: "Droplets",
    title: "Aqua water delivery",
    text: "Purified drinking water bottles for home and office, delivered on schedule.",
    aquaOnly: true,
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Choose",
    text: "Pick your favourites from the shop. No account required.",
  },
  {
    n: "02",
    title: "We craft",
    text: "Your order is cooked fresh in a small batch with pure ghee.",
  },
  {
    n: "03",
    title: "We pack",
    text: "Every box is checked and sealed in luxury packaging.",
  },
  {
    n: "04",
    title: "You enjoy",
    text: "Delivered to your door. Pay when it arrives.",
  },
];

// Sample reviews hata diye gaye. Jab real review ho tab yahan add karein, tab tak section nahi dikhta.
export const TESTIMONIALS = [];

/* ------------------------------------------------------------------ */
/* Pakistan (Aqua water only): jin visitors ko Mithai nahi dikhti        */
/* ------------------------------------------------------------------ */
export const AQUA_STATS = [
  { value: 10, suffix: "+", label: "Years of service" },
  { value: 5000, suffix: "+", label: "Happy customers" },
  { value: 3, suffix: "", label: "Bottle sizes" },
  { value: 100, suffix: "%", label: "Purified water" },
];

export const AQUA_WHY = [
  {
    icon: "Droplets",
    title: "Multi-stage purified",
    text: "Filtered and treated through several stages so every bottle tastes clean and fresh.",
  },
  {
    icon: "ShieldCheck",
    title: "Quality checked",
    text: "Every batch is tested and every bottle is sealed before it leaves us.",
  },
  {
    icon: "Truck",
    title: "Doorstep delivery",
    text: "Home and office delivery on your schedule, with pay on delivery.",
  },
  {
    icon: "Package",
    title: "Sizes for everyone",
    text: "500 ml, 1.5 L and 19 L bottles, single or in packs.",
  },
  {
    icon: "Gem",
    title: "Fair, clear prices",
    text: "Simple pricing in rupees with no hidden charges at the door.",
  },
  {
    icon: "HandHeart",
    title: "Regular supply",
    text: "Weekly or monthly refills for families, shops and offices.",
  },
];

export const AQUA_SERVICES = [
  {
    icon: "Droplets",
    title: "Aqua water delivery",
    text: "Purified drinking water bottles for home and office, delivered on schedule.",
  },
  {
    icon: "Building2",
    title: "Office supply",
    text: "Regular refills for offices, clinics and shops so you never run dry.",
  },
  {
    icon: "Package",
    title: "Bulk orders",
    text: "Special pricing and planning support when you order in larger quantities.",
  },
  {
    icon: "PartyPopper",
    title: "Events",
    text: "Bottled water for functions and gatherings, delivered on time.",
  },
  {
    icon: "Truck",
    title: "Doorstep delivery",
    text: "Careful, quick delivery with pay on delivery. No account needed.",
  },
];

export const AQUA_STEPS = [
  {
    n: "01",
    title: "Choose",
    text: "Pick your bottle size from the shop. No account required.",
  },
  {
    n: "02",
    title: "We purify",
    text: "Your water is purified, tested and sealed fresh.",
  },
  {
    n: "03",
    title: "We pack",
    text: "Bottles are checked and packed securely for the trip.",
  },
  {
    n: "04",
    title: "You enjoy",
    text: "Delivered to your door. Pay when it arrives.",
  },
];

// Sample reviews hata diye gaye. Jab real review ho tab yahan add karein, tab tak section nahi dikhta.
export const AQUA_TESTIMONIALS = [];

/* ------------------------------------------------------------------ */
/* FAQ (Home page par numbered accordion)                              */
/* ------------------------------------------------------------------ */
export const FAQS = [
  {
    q: "How fast is delivery?",
    a: "We deliver on the second day after your order. The exact timing depends on your state, so we confirm it with you when the order is placed.",
  },
  {
    q: "Do you have special rates for events?",
    a: "Yes. Weddings, birthdays and baby-born celebrations get special rates with special boxes. Message us with your date and the number of boxes and we will plan it with you.",
  },
  {
    q: "What is the Special Box?",
    a: "The Special Box holds 16 pieces and costs $20. It is made for gifting and celebrations, and you can pick your favourites from our 20 varieties.",
  },
  {
    q: "Which varieties do you make?",
    a: "Khoya, almond, pistachio, mango, chocolate, coffee, orange, besan, coconut and pineapple barfi, plus kaju katli, gulab jamun, laddu, kalakand, pink kalakand, milk cake, habshi halwa, khoya pera, gajar halwa and pateesa.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. Choose your mithai, place the order and pay when it arrives at your door.",
  },
  {
    q: "Can I order in bulk?",
    a: "Of course. Large orders for functions and gifting are welcome, and event orders get special rates. Contact us and we will help you plan quantities and delivery.",
  },
];
