import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Gift,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { SHOP_INFO } from "../config";
import { cld, imagesOf, tinyOf } from "../lib/img";
import { useGeo, useShop } from "../store";
import { useSale } from "./SaleBanner";

/* ------------------------------------------------------------------ */
/* HERO IMAGES  ->  client/public/hero/                                */
/*   Pakistan (Evelyn One): apna-pani-1.jpeg  apna-pani-2.jpeg  apna-pani-3.jpeg       */
/*   USA (Mithai):      mithai-1.jpg  mithai-2.jpg  mithai-3.jpg       */
/* Image na mile to admin ki product image, wo bhi na ho to illustration */
/* Images hamesha POORI dikhti hain (crop / stretch nahi hoti).        */
/* ------------------------------------------------------------------ */

const SLIDES = {
  PK: [
    {
      img: "/hero/apna-pani-1.jpeg",
      cat: "aqua",
      eyebrow: "Evelyn One pure & sealed",
      lines: ["Pure water,", "perfectly", "Evelyn One."],
      text: "Multi-stage purified drinking water, sealed fresh and delivered to your doorstep. Clean, crisp and trusted by families and offices across Pakistan.",
      tag: "500 ml · 1.5 L · 19 L",
      label: "The Perfect Choice",
      cta: { to: "/shop?cat=aqua", text: "Order Evelyn One" },
      chips: [
        { i: ShieldCheck, t: "Multi-stage purified", d: "Quality tested" },
        { i: Droplets, t: "Sealed fresh", d: "Every single bottle" },
        { i: Truck, t: "Doorstep delivery", d: "Cash on delivery" },
      ],
    },
    {
      img: "/hero/apna-pani-2.jpeg",
      cat: "aqua",
      eyebrow: "On the go",
      lines: ["Fresh for", "every single", "journey."],
      text: "Handy 500 ml and 1.5 L Evelyn One bottles for travel, school, gym, weddings and events. Packed in convenient cartons, always chilled-ready.",
      tag: "500 ml · 1.5 L",
      label: "Travel Bottles",
      cta: { to: "/shop?cat=aqua", text: "Shop bottles" },
      chips: [
        { i: Sparkles, t: "Light & handy", d: "500 ml · 1.5 L" },
        { i: Leaf, t: "Naturally clean", d: "Crisp clean taste" },
        { i: Truck, t: "Pay on delivery", d: "No account needed" },
      ],
    },
    {
      img: "/hero/apna-pani-3.jpeg",
      cat: "aqua",
      eyebrow: "Home & office",
      lines: ["19 litres of", "everyday", "trust."],
      text: "The refillable family-size Evelyn One bottle for your home or office dispenser. Order once, get regular quick delivery whenever you need it.",
      tag: "19 L · Per bottle",
      label: "Family Size",
      cta: { to: "/shop?cat=aqua", text: "Shop 19 L bottle" },
      chips: [
        { i: Droplets, t: "19 L refillable", d: "Dispenser ready" },
        { i: ShieldCheck, t: "Quality checked", d: "Clean every time" },
        { i: Truck, t: "Quick delivery", d: "Right to your door" },
      ],
    },
  ],
  US: [
    {
      img: "/hero/mithai-1.jpg",
      cat: "sweets",
      eyebrow: "Handcrafted mithai",
      lines: ["Mithai made for", "every grand", "celebration."],
      text: "Hand-rolled in small batches with pure desi ghee, real khoya and whole nuts. Authentic Pakistani sweets, gift-boxed and delivered fresh to your door.",
      tag: "Box · 16 pcs",
      label: "Signature Mithai",
      cta: { to: "/shop", text: "Shop mithai" },
      chips: [
        { i: Sparkles, t: "Pure desi ghee", d: "Real khoya, no shortcuts" },
        { i: Leaf, t: "Made fresh", d: "Small batches daily" },
        { i: Truck, t: SHOP_INFO.delivery.title, d: SHOP_INFO.delivery.note },
      ],
    },
    {
      img: "/hero/mithai-2.jpg",
      cat: "sweets",
      eyebrow: "Weddings · Birthdays · Baby born",
      lines: ["Special boxes", "for your", "special day."],
      text: `Special rates for events. A gift-ready Special Box of ${SHOP_INFO.special.box.pieces} pieces for just $${SHOP_INFO.special.box.price}, chosen from our 20 varieties.`,
      tag: `Special Box · $${SHOP_INFO.special.box.price}`,
      label: "Special Event Box",
      cta: { to: "/shop?q=Special", text: "Order a Special Box" },
      chips: [
        {
          i: Gift,
          t: `${SHOP_INFO.special.box.pieces} pieces`,
          d: "Chosen by you",
        },
        { i: Star, t: "Event rates", d: "Weddings & birthdays" },
        { i: Truck, t: SHOP_INFO.delivery.short, d: "Timing depends on state" },
      ],
    },
    {
      img: "/hero/mithai-3.jpg",
      cat: "sweets",
      eyebrow: "20 signature varieties",
      lines: ["Barfi, halwa,", "kalakand &", "so much more."],
      text: "Khoya Barfi, Kaju Katli, Gulab Jamun, Milk Cake, Pink Kalakand, Gajar Halwa and more. Twenty varieties, one royal table.",
      tag: "20 varieties",
      label: "Full Collection",
      cta: { to: "/shop", text: "Explore all 20" },
      chips: [
        { i: Star, t: "20 varieties", d: "Something for everyone" },
        { i: Gift, t: "Gift ready", d: "Luxury packaging" },
        { i: Sparkles, t: "Loved by families", d: "Freshness & taste" },
      ],
    },
  ],
};

const CSS = `
@keyframes hxRise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
.hx-rise{animation:hxRise .85s cubic-bezier(.2,.7,.2,1) both}
@keyframes hxReveal{from{opacity:0;clip-path:inset(0 0 100% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
.hx-reveal{animation:hxReveal 1.1s cubic-bezier(.2,.8,.2,1) both}
@keyframes hxKen{from{transform:scale(1)}to{transform:scale(1.045)}}
.hx-ken{animation:hxKen 9s ease-out both}
@keyframes hxProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.hx-prog{transform-origin:left;animation:hxProg 6.5s linear forwards}
@keyframes hxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hx-float{animation:hxFloat 6s ease-in-out infinite}
@keyframes hxSpin{to{transform:rotate(360deg)}}
.hx-spin{animation:hxSpin 22s linear infinite}
@keyframes hxSheen{from{transform:translateX(-130%) skewX(-18deg)}to{transform:translateX(330%) skewX(-18deg)}}
.hx-sheen{animation:hxSheen 2.2s ease-in-out 1.1s 1 both}
@media (prefers-reduced-motion:reduce){.hx-rise,.hx-reveal,.hx-ken,.hx-float,.hx-spin,.hx-sheen{animation:none}}
`;

/* ---------- Fallback illustrations (jab image na ho) ---------- */
function WaterArt() {
  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="wa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a3a78" />
          <stop offset="1" stopColor="#060607" />
        </linearGradient>
        <linearGradient id="wa-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9ccbf7" stopOpacity=".55" />
          <stop offset=".5" stopColor="#f1f8ff" stopOpacity=".9" />
          <stop offset="1" stopColor="#3d9bea" stopOpacity=".6" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#wa-bg)" />
      <circle cx="320" cy="90" r="70" fill="#4aa3f0" opacity=".18" />
      <circle cx="70" cy="380" r="90" fill="#4aa3f0" opacity=".12" />
      {/* side bottles */}
      <g opacity=".55">
        <rect
          x="52"
          y="230"
          width="62"
          height="190"
          rx="22"
          fill="url(#wa-body)"
        />
        <rect x="68" y="208" width="30" height="28" rx="6" fill="#4aa3f0" />
        <rect
          x="286"
          y="250"
          width="62"
          height="170"
          rx="22"
          fill="url(#wa-body)"
        />
        <rect x="302" y="228" width="30" height="28" rx="6" fill="#4aa3f0" />
      </g>
      {/* main bottle */}
      <rect x="168" y="70" width="64" height="36" rx="9" fill="#4aa3f0" />
      <path
        d="M172 104h56v34c0 22 38 34 38 78v196a32 32 0 0 1-32 32h-68a32 32 0 0 1-32-32V216c0-44 38-56 38-78z"
        fill="url(#wa-body)"
        stroke="#dcebfd"
        strokeWidth="2"
      />
      <path
        d="M134 300c22 14 44 14 66 0s44-14 66 0v112a22 22 0 0 1-22 22h-88a22 22 0 0 1-22-22z"
        fill="#4aa3f0"
        opacity=".35"
      />
      <rect
        x="138"
        y="262"
        width="124"
        height="86"
        rx="12"
        fill="#fff"
        opacity=".92"
      />
      <text
        x="200"
        y="312"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontWeight="700"
        fontSize="28"
        fill="#222227"
      >
        Evelyn One
      </text>
      <text
        x="200"
        y="334"
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight="700"
        fontSize="9"
        letterSpacing="3"
        fill="#0a3a78"
      >
        PURE WATER
      </text>
    </svg>
  );
}

function SweetArt() {
  const piece = (x, y, c1, c2, r = 0, s = 1) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x="-46" y="-46" width="92" height="92" rx="14" fill={c1} />
      <rect
        x="-46"
        y="-46"
        width="92"
        height="46"
        rx="14"
        fill={c2}
        opacity=".35"
      />
      <circle cx="0" cy="0" r="10" fill="#fff" opacity=".55" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a2552" />
          <stop offset="1" stopColor="#1c0716" />
        </linearGradient>
        <radialGradient id="sa-plate" cx=".5" cy=".4" r=".7">
          <stop offset="0" stopColor="#fff7f0" />
          <stop offset="1" stopColor="#f3c9d3" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#sa-bg)" />
      <circle cx="330" cy="90" r="70" fill="#fb7185" opacity=".2" />
      <circle cx="60" cy="400" r="90" fill="#86efac" opacity=".1" />
      <ellipse cx="200" cy="380" rx="170" ry="46" fill="#000" opacity=".25" />
      <ellipse cx="200" cy="350" rx="170" ry="60" fill="url(#sa-plate)" />
      <ellipse
        cx="200"
        cy="344"
        rx="132"
        ry="40"
        fill="none"
        stroke="#fb7185"
        strokeWidth="1.5"
        strokeDasharray="3 6"
        opacity=".6"
      />
      {piece(130, 300, "#fb7185", "#fff", 45, 0.85)}
      {piece(270, 300, "#86efac", "#fff", 45, 0.85)}
      {piece(200, 250, "#fde68a", "#fff", 45, 1)}
      {piece(200, 170, "#f9a8d4", "#fff", 45, 0.85)}
      <g fill="#fff" opacity=".9">
        <circle cx="130" cy="296" r="3" />
        <circle cx="270" cy="296" r="3" />
        <circle cx="200" cy="246" r="3" />
      </g>
    </svg>
  );
}

function SlideImg({ cands, alt, art = null, ken = false, first = false }) {
  const [n, setN] = useState(0);
  const [ok, setOk] = useState(false);
  const src = cands[n];
  if (!src) return art;
  const url = cld(src, "f_auto,q_auto,w_1200");
  const tiny = tinyOf(src);
  return (
    <>
      {/* dhundhla backdrop: contain image ke aas-paas khali jagah isi image ke rang se bhar jati hai
          (bohat chhoti image se, CSS blur filter ke baghair, taake scroll smooth rahe) */}
      <img
        src={tiny || url}
        alt=""
        aria-hidden="true"
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full scale-110 object-cover transition-opacity duration-500 ${ok ? "opacity-70" : "opacity-0"} ${tiny ? "" : "blur-xl"}`}
      />
      <img
        ref={(el) => {
          if (el && el.complete && el.naturalWidth > 0 && !ok) setOk(true);
        }}
        src={url}
        alt={alt}
        decoding="async"
        fetchpriority={first ? "high" : "auto"}
        draggable={false}
        onLoad={() => setOk(true)}
        onError={() => {
          setOk(false);
          setN((v) => v + 1);
        }}
        className={`relative h-full w-full object-contain transition-opacity duration-500 ${ok ? "opacity-100" : "opacity-0"} ${ken ? "hx-ken" : ""}`}
      />
    </>
  );
}

export default function HeroLuxury() {
  const { country } = useGeo();
  const { products } = useShop();
  const sale = useSale();
  const code = country.code === "PK" ? "PK" : "US";
  const slides = SLIDES[code];
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  // jo slides ek baar dikh chuki hain wo mounted rehti hain (dobara download/flash nahi)
  const seen = useRef(new Set([0]));
  seen.current.add(i);

  const go = (d) => setI((v) => (v + d + n) % n);

  // Har slide ke liye: pehle apni file, phir product ki image
  const cands = useMemo(
    () =>
      slides.map((s, k) => {
        const withImg = products.filter(
          (p) => p.category === s.cat && imagesOf(p).length,
        );
        const p = withImg.length ? withImg[k % withImg.length] : null;
        return [s.img, p ? imagesOf(p)[0] : null].filter(Boolean);
      }),
    [slides, products],
  );

  const s = slides[i];
  const pad = (v) => String(v).padStart(2, "0");
  const art = code === "PK" ? <WaterArt /> : <SweetArt />;
  const btnBase =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-bold tracking-wide transition duration-500 hover:-translate-y-1 active:scale-95 sm:px-8";

  return (
    <section
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden bg-white text-royal"
    >
      <style>{CSS}</style>

      {/* ultra-fine vertical guide lines (background pure white hi rehta hai) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 lg:block"
      >
        <span className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />
        <span className="absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />
      </div>

      <div className="container-x relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:min-h-[740px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-24 lg:pt-20">
        {/* ---------------- Text side ---------------- */}
        <div key={i} className="relative order-2 min-w-0 lg:order-1">
          <span className="hx-rise inline-flex max-w-full items-center gap-2.5 rounded-full border border-royal/10 bg-white py-1.5 pl-3 pr-4 text-xs font-semibold shadow-[0_8px_30px_-10px_rgba(0,0,0,.25)]">
            <span className="truncate text-gold-600">{s.eyebrow}</span>
          </span>

          <h1 className="mt-6 font-display text-[2.9rem] font-bold leading-[0.98] text-royal sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]">
            {s.lines.map((ln, k) => (
              <span
                key={ln}
                className="hx-rise block"
                style={{ animationDelay: `${120 + k * 120}ms` }}
              >
                {k === s.lines.length - 1 ? (
                  <span className="relative inline-block">
                    {ln}
                    <span className="absolute -bottom-1 left-0 h-[5px] w-full origin-left rounded-full bg-gradient-to-r from-[#1d7fe0] via-[#4aa3f0] to-transparent" />
                  </span>
                ) : (
                  ln
                )}
              </span>
            ))}
          </h1>

          <p
            className="hx-rise mt-7 max-w-lg text-[15px] leading-relaxed text-neutral-600 sm:text-base"
            style={{ animationDelay: "500ms" }}
          >
            {s.text}
          </p>

          <div
            className="hx-rise mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "620ms" }}
          >
            <Link
              to={s.cta.to}
              className={`${btnBase} text-white shadow-xl shadow-gold-500/30 hover:shadow-2xl hover:shadow-gold-500/40`}
              style={{
                backgroundImage:
                  "linear-gradient(110deg,#0b0b0d,#0a3a78 55%,#1d7fe0 85%,#0b0b0d)",
                backgroundSize: "240% 100%",
              }}
            >
              {s.cta.text}
              <ArrowRight
                size={16}
                className="transition duration-500 group-hover:translate-x-1"
              />
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full skew-x-[-18deg] bg-white/30 transition duration-700 group-hover:translate-x-[420%]" />
            </Link>
            <Link
              to={code === "PK" ? "/about" : "/contact"}
              className={`${btnBase} border-2 border-royal bg-white text-royal hover:bg-royal hover:text-white`}
            >
              {code === "PK" ? "About Evelyn One" : "Event orders"}
            </Link>
          </div>

          {/* chips: ek hi luxury strip, beech me patli lines */}
          <div
            className="hx-rise mt-9 grid max-w-xl overflow-hidden rounded-2xl border border-royal/10 bg-white shadow-[0_20px_50px_-25px_rgba(0,0,0,.35)] sm:grid-cols-3"
            style={{ animationDelay: "740ms" }}
          >
            {s.chips.map((c, k) => (
              <div
                key={c.t}
                className={`group flex items-center gap-3 p-3.5 transition duration-500 hover:bg-royal sm:flex-col sm:items-start sm:gap-2 ${k > 0 ? "border-t border-royal/10 sm:border-l sm:border-t-0" : ""}`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1d7fe0] to-[#0a3a78] text-white transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <c.i size={16} />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[13px] font-bold text-royal transition duration-500 group-hover:text-white">
                    {c.t}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-neutral-500 transition duration-500 group-hover:text-white/70">
                    {c.d}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Image side ---------------- */}
        <div className="relative order-1 min-w-0 lg:order-2">
          <div className="relative mx-auto w-full max-w-[680px] pb-7 pr-2 sm:pr-4 lg:max-w-none">
            {/* offset outline frame */}
            <div className="pointer-events-none absolute bottom-0 left-4 right-0 top-5 rounded-[1.6rem] border border-gold-500/60 sm:left-6 sm:top-6 sm:rounded-[2.2rem]" />

            {/* main stage: aspect 3/2, image poori dikhti hai */}
            <div className="hx-reveal relative aspect-[3/2] w-full overflow-hidden rounded-[1.4rem] border-[5px] border-white bg-white shadow-[0_40px_90px_-30px_rgba(11,11,13,.55)] ring-1 ring-royal/10 sm:rounded-[2rem] sm:border-8">
              {slides.map((sl, k) => (
                <div
                  key={sl.img}
                  aria-hidden={k !== i}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-out ${k === i ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"}`}
                >
                  {/* sirf maujooda + agli slide load hoti hai (pehle teeno saath load hoti thin) */}
                  {(k === i || k === (i + 1) % n || seen.current.has(k)) && (
                    <SlideImg
                      cands={cands[k]}
                      alt={sl.label}
                      art={art}
                      ken={k === i}
                      first={k === 0}
                    />
                  )}
                </div>
              ))}
              {/* one-time sheen */}
              <span
                key={`sh-${i}`}
                className="hx-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
              {/* corner brackets */}
              {[
                "left-3 top-3 border-l-2 border-t-2 rounded-tl-xl",
                "right-3 top-3 border-r-2 border-t-2 rounded-tr-xl",
                "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-xl",
                "bottom-3 right-3 border-b-2 border-r-2 rounded-br-xl",
              ].map((c) => (
                <span
                  key={c}
                  className={`pointer-events-none absolute h-5 w-5 border-white/80 sm:h-7 sm:w-7 ${c}`}
                />
              ))}

              {/* arrows */}
              {[
                [-1, "Previous slide", ChevronLeft, "left-2 sm:left-4"],
                [1, "Next slide", ChevronRight, "right-2 sm:right-4"],
              ].map(([d, label, Ic, pos]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(d)}
                  aria-label={label}
                  className={`absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/85 text-royal shadow-lg backdrop-blur transition duration-300 hover:scale-110 hover:bg-royal hover:text-white sm:h-11 sm:w-11 ${pos}`}
                >
                  <Ic size={18} />
                </button>
              ))}

              {/* counter */}
              <div className="absolute right-3 top-3 z-10 rounded-full bg-royal/85 px-3 py-1 font-display text-sm font-bold tabular-nums text-white backdrop-blur sm:right-5 sm:top-5">
                {pad(i + 1)}
                <span className="text-white/45"> / {pad(n)}</span>
              </div>
            </div>

            {/* plaque */}
            <div
              key={`pl-${i}`}
              className="hx-rise absolute bottom-0 left-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-2xl bg-royal py-2.5 pl-4 pr-2.5 text-white shadow-2xl shadow-black/30 sm:left-8 sm:gap-4 sm:py-3 sm:pl-5 sm:pr-3"
            >
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[10px] font-bold uppercase tracking-[0.24em] text-[#7fbaf7]">
                  {s.tag}
                </span>
                <span className="block truncate font-display text-xl font-bold sm:text-2xl">
                  {s.label}
                </span>
              </span>
              <Link
                to={s.cta.to}
                aria-label={s.cta.text}
                className="group/go grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 text-white transition duration-300 hover:scale-110 hover:bg-gold-600 sm:h-11 sm:w-11"
              >
                <ArrowUpRight
                  size={18}
                  className="transition duration-300 group-hover/go:rotate-45"
                />
              </Link>
            </div>

            {/* rotating seal */}
            <div className="absolute -top-4 right-0 hidden h-24 w-24 sm:block lg:h-28 lg:w-28">
              <svg viewBox="0 0 120 120" className="hx-spin absolute inset-0">
                <defs>
                  <path
                    id="hero-ring"
                    d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
                  />
                </defs>
                <circle cx="60" cy="60" r="57" fill="#0b0b0d" />
                <circle
                  cx="60"
                  cy="60"
                  r="57"
                  fill="none"
                  stroke="#1d7fe0"
                  strokeWidth="1.4"
                />
                <text
                  fontFamily="Manrope, sans-serif"
                  fontSize="10.5"
                  fontWeight="800"
                  letterSpacing="3.2"
                  fill="#ffffff"
                >
                  <textPath href="#hero-ring">
                    {code === "PK"
                      ? "EVELYN ONE · PURE · SEALED · FRESH · "
                      : "MITHAI HOUSE · HANDMADE · PURE GHEE · "}
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 grid place-items-center text-[#4aa3f0]">
                {code === "PK" ? (
                  <Droplets size={26} />
                ) : (
                  <Sparkles size={26} />
                )}
              </div>
            </div>

            {/* SALE sticker (admin sale lagate hi foran aata hai) */}
            {sale.active && (
              <div
                key={sale.max}
                className="absolute -left-1 top-6 z-20 sm:-left-5"
              >
                <Link
                  to="/shop"
                  className="hx-float group/s relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#4aa3f0] to-[#0a3a78] text-center text-white shadow-2xl shadow-gold-500/40 ring-4 ring-white transition duration-300 hover:scale-110 sm:h-24 sm:w-24"
                >
                  <span className="leading-none">
                    <span className="block text-[8px] font-extrabold uppercase tracking-[0.25em] text-white/85">
                      {sale.same ? "Sale" : "Up to"}
                    </span>
                    <span className="block font-display text-3xl font-bold sm:text-4xl">
                      {sale.max}%
                    </span>
                    <span className="block text-[9px] font-extrabold tracking-[0.3em]">
                      OFF
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* thumbnails rail */}
          <div className="mx-auto mt-5 grid w-full max-w-[680px] grid-cols-3 gap-2.5 sm:gap-4 lg:max-w-none">
            {slides.map((sl, k) => (
              <button
                key={sl.img}
                type="button"
                onClick={() => setI(k)}
                aria-label={`Show slide ${k + 1}: ${sl.label}`}
                aria-current={k === i}
                className="group min-w-0 text-left"
              >
                <span
                  className={`relative block aspect-[3/2] overflow-hidden rounded-xl border bg-neutral-50 transition duration-500 ${k === i ? "border-gold-500 shadow-lg shadow-gold-500/20" : "border-royal/10 opacity-70 group-hover:-translate-y-1 group-hover:opacity-100"}`}
                >
                  <ThumbImg cands={cands[k]} />
                </span>
                <span className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-royal/10">
                  {k === i && (
                    <span
                      key={`p-${i}`}
                      className="hx-prog block h-full w-full rounded-full bg-gold-500"
                      style={{
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      onAnimationEnd={() => go(1)}
                    />
                  )}
                </span>
                <span
                  className={`mt-1.5 block truncate text-[11px] font-semibold transition duration-500 ${k === i ? "text-royal" : "text-royal/45 group-hover:text-royal/80"}`}
                >
                  {sl.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-royal/15 to-transparent" />
    </section>
  );
}

function ThumbImg({ cands }) {
  const [n, setN] = useState(0);
  const src = cands[n];
  if (!src)
    return (
      <span className="grid h-full w-full place-items-center text-xl">✦</span>
    );
  return (
    <img
      src={cld(src, "f_auto,q_auto,w_400")}
      alt=""
      draggable={false}
      loading="lazy"
      onError={() => setN((v) => v + 1)}
      className="h-full w-full object-contain"
    />
  );
}
