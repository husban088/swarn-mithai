import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Reveal from "./Reveal";
import { CATEGORIES } from "../config";
import { cld, imagesOf, tinyOf } from "../lib/img";
import { useGeo, useShop } from "../store";

// Har category ke liye: apni image (client/public/hero/...) -> product image -> emoji
const META = {
  aqua: {
    img: "/hero/apna-pani-1.jpeg",
    dark: true,
    kicker: "Evelyn One",
    points: [
      "500 ml · 1.5 L · 19 L",
      "Multi-stage purified",
      "Pay on delivery",
    ],
    cta: "Shop Evelyn One",
  },
  sweets: {
    img: null,
    dark: false,
    kicker: "Best Mithai",
    points: [
      "Pure desi ghee & real khoya",
      "20 signature varieties",
      "Gift-ready boxes",
    ],
    cta: "Shop mithai",
  },
};

const CSS = `
.cc-card{transition:transform .6s cubic-bezier(.2,.7,.2,1),box-shadow .6s ease,border-color .6s ease}
.cc-card:hover{transform:translateY(-8px)}
@keyframes ccSheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(480%) skewX(-18deg)}}
.cc-card:hover .cc-sheen{animation:ccSheen 1.2s ease}
@media (prefers-reduced-motion:reduce){.cc-card:hover{transform:none}.cc-card:hover .cc-sheen{animation:none}}
`;

function CatImage({ cands, emoji, dark, onRatio }) {
  const [n, setN] = useState(0);
  const [ok, setOk] = useState(false);
  const src = cands[n];
  if (!src)
    return (
      <span
        className={`grid h-full w-full place-items-center text-7xl sm:text-8xl ${dark ? "text-white" : "text-royal"}`}
      >
        {emoji}
      </span>
    );
  const url = cld(src, "f_auto,q_auto,w_1200");
  const tiny = tinyOf(src);
  return (
    <>
      {/* dhundhla backdrop sirf image load hone ke baad (loading ke waqt blur nahi dikhta) */}
      <img
        src={tiny || url}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ok ? "opacity-70" : "opacity-0"} ${tiny ? "" : "blur-xl"}`}
      />
      <img
        ref={(el) => {
          if (el && el.complete && el.naturalWidth > 0 && !ok) {
            setOk(true);
            onRatio(el.naturalWidth / el.naturalHeight);
          }
        }}
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={(e) => {
          const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
          if (w && h) onRatio(w / h);
          setOk(true);
        }}
        onError={() => {
          setOk(false);
          setN((v) => v + 1);
        }}
        className={`relative block h-full w-full object-contain transition-opacity duration-500 ${ok ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

// Image ka frame: image ki asli width/height ratio le leta hai, is liye poori image dikhti hai,
// na crop, na stretch, na kisi side white space.
function CatFrame({ cands, emoji, dark }) {
  const [ratio, setRatio] = useState(0);
  return (
    <div
      style={{ aspectRatio: ratio || "4 / 3" }}
      className={`relative w-full self-start overflow-hidden rounded-xl ring-1 ${dark ? "bg-white/5 ring-white/15" : "bg-neutral-50 ring-royal/10"}`}
    >
      <CatImage cands={cands} emoji={emoji} dark={dark} onRatio={setRatio} />
      <span className="cc-sheen pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

// "Evelyn One aur Best Mithai" ke 2 luxury cards (pure white section)
export default function CategoryCards({ sweets, aqua }) {
  const { country } = useGeo();
  const { products } = useShop();
  const cats = country.categories;
  const single = cats.length === 1;

  return (
    <section className="relative bg-white py-14 sm:py-20">
      <style>{CSS}</style>
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Collections</span>
          <h2 className="title-lg mt-3">
            {sweets && aqua
              ? "Two ways to order"
              : sweets
                ? "What we make"
                : "What we deliver"}
          </h2>
        </Reveal>

        <div
          className={`mt-10 grid gap-6 sm:mt-14 lg:gap-8 ${single ? "" : "md:grid-cols-2"}`}
        >
          {cats.map((c, k) => {
            const m = META[c];
            const cat = CATEGORIES[c];
            const list = products.filter((p) => p.category === c);
            const withImg = list.find((p) => imagesOf(p).length);
            const cands = [m.img, withImg ? imagesOf(withImg)[0] : null].filter(
              Boolean,
            );
            const dark = m.dark;
            return (
              <Reveal key={c} delay={k * 120} className="h-full">
                <Link
                  to={`/shop?cat=${c}`}
                  className={`cc-card group relative grid h-full content-start overflow-hidden rounded-[2rem] border p-3 sm:p-4 ${single ? "md:grid-cols-2 md:items-center" : ""} ${dark ? "border-royal bg-royal text-white shadow-[0_40px_80px_-35px_rgba(11,11,13,.7)] hover:shadow-[0_50px_90px_-30px_rgba(29,127,224,.55)]" : "border-royal/15 bg-white text-royal shadow-[0_40px_80px_-40px_rgba(11,11,13,.4)] hover:border-gold-500 hover:shadow-[0_50px_90px_-35px_rgba(29,127,224,.45)]"}`}
                >
                  {/* image frame: poori image, crop nahi, koi badge image ke upar nahi */}
                  <CatFrame cands={cands} emoji={cat.icon} dark={dark} />

                  {/* text */}
                  <div className="relative flex min-w-0 flex-col p-4 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${dark ? "bg-white text-royal" : "bg-royal text-white"}`}
                      >
                        {m.kicker}
                      </span>
                      {list.length > 0 && (
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-bold ${dark ? "border-white/30 text-white/90" : "border-royal/20 text-royal"}`}
                        >
                          {list.length}{" "}
                          {list.length === 1 ? "product" : "products"}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`font-display text-4xl font-bold leading-none sm:text-5xl ${dark ? "text-white" : "text-royal"}`}
                    >
                      {cat.label}
                    </h3>
                    <span className="mt-4 block h-[3px] w-14 rounded-full bg-gradient-to-r from-[#1d7fe0] to-[#4aa3f0] transition-all duration-700 group-hover:w-28" />
                    <p
                      className={`mt-4 max-w-md text-sm leading-relaxed sm:text-[15px] ${dark ? "text-white/70" : "text-neutral-600"}`}
                    >
                      {cat.blurb}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {m.points.map((pt) => (
                        <li
                          key={pt}
                          className={`flex items-center gap-2.5 text-[13px] font-semibold ${dark ? "text-white/90" : "text-royal"}`}
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-500 text-white">
                            <Check size={12} strokeWidth={3} />
                          </span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <span
                      className={`mt-7 inline-flex w-fit items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-bold transition duration-500 group-hover:gap-5 ${dark ? "bg-white text-royal" : "bg-royal text-white"}`}
                    >
                      {m.cta}
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-white transition duration-500 group-hover:rotate-45">
                        <ArrowUpRight size={17} />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
