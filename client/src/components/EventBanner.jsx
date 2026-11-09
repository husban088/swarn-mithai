import { Link } from "react-router-dom";
import { ArrowRight, Baby, Cake, Gift, Heart, Truck } from "lucide-react";
import Reveal from "./Reveal";
import { SHOP_INFO } from "../config";
import { useGeo, useShop } from "../store";

const OCCASIONS = [
  { label: "Weddings", icon: Heart, text: "Nikah, mehndi and walima boxes" },
  { label: "Birthdays", icon: Cake, text: "Sweet boxes for every party" },
  { label: "Baby Born", icon: Baby, text: "Celebrate a new arrival" },
];

const RING_TEXT =
  "SPECIAL BOX\u00A0\u00A0✦\u00A0\u00A016 PIECES\u00A0\u00A0✦\u00A0\u00A0WEDDINGS\u00A0\u00A0✦\u00A0\u00A0BIRTHDAYS\u00A0\u00A0✦\u00A0\u00A0BABY BORN\u00A0\u00A0✦\u00A0\u00A0";

const EV_CSS = `
.ev-spin{animation:evSpin 46s linear infinite}
@keyframes evSpin{to{transform:rotate(360deg)}}
.ev-dot{opacity:.25;transform-box:fill-box;transform-origin:center;animation:evDot 3.2s ease-in-out infinite}
@keyframes evDot{0%,100%{opacity:.25;transform:scale(1)}8%,16%{opacity:1;transform:scale(1.9)}30%{opacity:.25;transform:scale(1)}}
@keyframes evPulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.22);opacity:0}}
.ev-pulse{animation:evPulse 3.4s ease-out infinite}
@keyframes evSheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(480%) skewX(-18deg)}}
.ev-card:hover .ev-sheen{animation:evSheen 1.1s ease}
.ev-line{background:linear-gradient(90deg,#4aa3f0,#eaf4ff 50%,#4aa3f0);background-size:200% 100%;animation:evLine 4s linear infinite}
@keyframes evLine{to{background-position:-200% 0}}
.ev-cta .ev-arrow{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.ev-cta:hover .ev-arrow{transform:translateX(5px)}
@media (prefers-reduced-motion:reduce){
  .ev-spin,.ev-dot,.ev-pulse,.ev-line{animation:none}
  .ev-dot{opacity:.7}
  .ev-card:hover .ev-sheen{animation:none}
}
`;

// Second-day delivery ki chhoti line (product page, modal, footer, checkout par)
export function DeliveryNote({ className = "" }) {
  const { country } = useGeo();
  if (!country.categories.includes("sweets")) return null;
  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border border-champ-200 bg-white p-4 text-sm text-royal transition duration-300 hover:-translate-y-0.5 hover:border-champ-400 hover:shadow-lg hover:shadow-champ-200/50 ${className}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#060607] to-gold-600 text-white transition duration-500 group-hover:rotate-6 group-hover:scale-110">
        <Truck size={18} />
      </span>
      <span>
        <b>{SHOP_INFO.delivery.title}</b>
        <span className="block text-xs text-neutral-500">
          {SHOP_INFO.delivery.note}
        </span>
      </span>
    </div>
  );
}

// Events ke special rates + $20 / 16 pieces Special Box
// variant="full" (Home) | "compact" (Shop, Product page)
export default function EventBanner({ variant = "full", className = "" }) {
  const { country } = useGeo();
  const { products } = useShop();
  if (!country.categories.includes("sweets")) return null;
  const { special, delivery } = SHOP_INFO;
  const box = products.find((p) => /special/i.test(p.name));
  const to = box ? `/product/${box.id}` : "/shop";

  if (variant === "compact") {
    return (
      <div
        className={`grain glow-border group relative overflow-hidden rounded-3xl bg-royal p-5 text-champ-100 sm:p-6 ${className}`}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-glow rounded-full bg-champ-400/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl champ-bg text-royal shadow-lg transition duration-500 group-hover:rotate-6 group-hover:scale-110">
            <Gift size={24} />
          </span>
          <div className="min-w-0 flex-1 basis-56">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-champ-300">
              {special.title}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-champ-100/85">
              {special.text}{" "}
              <b className="text-white">
                {special.box.name} ${special.box.price} · {special.box.pieces}{" "}
                pieces.
              </b>
            </p>
            <p className="mt-1 text-xs text-champ-200/70">
              {delivery.title}. {delivery.note}
            </p>
          </div>
          <Link to={to} className="btn-champ !px-6 !py-3">
            View box <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="container-x py-14 sm:py-20">
      <style>{EV_CSS}</style>
      <Reveal>
        <div className="grain glow-border relative overflow-hidden rounded-[2rem] bg-royal p-5 sm:rounded-[2.5rem] sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-glow rounded-full bg-champ-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 animate-glow rounded-full bg-gold-500/30 blur-3xl" />

          <div className="relative grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.15fr_1fr]">
            {/* ============ LEFT ============ */}
            <div className="min-w-0">
              <span className="eyebrow !text-champ-300">Celebrations</span>
              <h2 className="mt-3 font-display text-[2.4rem] font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                Special rates for <span className="gold-text">every event</span>
              </h2>
              <span className="ev-line mt-5 block h-[2px] w-24 rounded-full" />
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-champ-100/80 sm:text-base">
                {special.text} Choose your favourites from 20 varieties and we
                pack them in elegant special boxes.
              </p>

              <div className="mt-7 grid gap-3 sm:mt-8 sm:grid-cols-3">
                {OCCASIONS.map(({ label, icon: Icon, text }, i) => (
                  <Link
                    key={label}
                    to="/events"
                    style={{ animationDelay: `${i * 120}ms` }}
                    className="ev-card group relative flex animate-fadeUp items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur transition duration-500 hover:-translate-y-1.5 hover:border-champ-300/70 hover:bg-white/[0.1] hover:shadow-2xl hover:shadow-black/40 sm:flex-col sm:items-start sm:gap-0 sm:p-5"
                  >
                    {/* big faded icon behind */}
                    <Icon
                      aria-hidden="true"
                      size={96}
                      strokeWidth={1}
                      className="ev-ghost pointer-events-none absolute -bottom-5 -right-4 text-champ-300/10 transition duration-700 group-hover:-rotate-12 group-hover:scale-125 group-hover:text-champ-300/25"
                    />
                    <span
                      aria-hidden="true"
                      className="ev-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-[140%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-champ-300/40 text-champ-300 transition duration-500 group-hover:rotate-12 group-hover:bg-champ-400 group-hover:text-royal">
                      <Icon size={20} />
                    </span>
                    <div className="relative min-w-0 sm:mt-4">
                      <div className="font-display text-2xl font-bold leading-tight text-champ-100">
                        {label}
                      </div>
                      <div className="mt-0.5 text-xs leading-snug text-champ-100/65">
                        {text}
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 champ-bg transition duration-500 group-hover:scale-x-100"
                    />
                  </Link>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                <Link to={to} className="ev-cta btn-champ !px-8 !py-3.5">
                  Order the Special Box{" "}
                  <ArrowRight size={16} className="ev-arrow" />
                </Link>
                <Link to="/contact" className="btn-ghost-light !px-8 !py-3.5">
                  Plan my event
                </Link>
              </div>
            </div>

            {/* ============ RIGHT: price medallion ============ */}
            <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-sm">
              <div className="absolute inset-0 animate-glow rounded-full bg-champ-400/30 blur-3xl" />
              <div className="group relative aspect-square">
                {/* rotating text ring */}
                <svg
                  viewBox="0 0 400 400"
                  className="ev-spin absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="evRing"
                      d="M200,200 m-176,0 a176,176 0 1,1 352,0 a176,176 0 1,1 -352,0"
                    />
                  </defs>
                  <circle
                    cx="200"
                    cy="200"
                    r="195"
                    fill="none"
                    stroke="#4aa3f0"
                    strokeOpacity=".5"
                    strokeWidth="1.5"
                  />
                  <text
                    fontFamily="Manrope, sans-serif"
                    fontSize="16"
                    fontWeight="700"
                    letterSpacing="4"
                    fill="#cfe3fa"
                  >
                    <textPath href="#evRing" textLength="1100">
                      {RING_TEXT}
                    </textPath>
                  </text>
                </svg>

                {/* 16 dots = 16 pieces, lighting up one after another */}
                <svg
                  viewBox="0 0 400 400"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  {Array.from({ length: 16 }).map((_, k) => {
                    const a = (k / 16) * Math.PI * 2 - Math.PI / 2;
                    return (
                      <circle
                        key={k}
                        cx={200 + Math.cos(a) * 146}
                        cy={200 + Math.sin(a) * 146}
                        r="5"
                        fill="#7ab9f3"
                        className="ev-dot"
                        style={{ animationDelay: `${k * 0.2}s` }}
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-[17%] grid place-items-center rounded-full border border-champ-300/40 bg-gradient-to-br from-[#0a3a78]/70 to-[#060607]/80 text-center shadow-2xl shadow-black/40 backdrop-blur transition duration-700 group-hover:scale-105">
                  <span
                    aria-hidden="true"
                    className="ev-pulse absolute inset-0 rounded-full border border-champ-300/40"
                  />
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.28em] text-champ-300 sm:text-[11px]">
                      Special box
                    </div>
                    <div className="gold-text font-display text-6xl font-bold leading-none sm:text-7xl">
                      ${special.box.price}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-champ-100 sm:text-sm">
                      {special.box.pieces} pieces
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ delivery strip ============ */}
          <div className="relative mt-9 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-champ-100/80 backdrop-blur sm:mt-10 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
            <span className="inline-flex items-center gap-3 font-semibold text-champ-100">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-champ-300/40 text-champ-300">
                <Truck size={18} />
              </span>
              {delivery.title}
            </span>
            <span className="hidden h-6 w-px bg-white/15 sm:block" />
            <span className="leading-snug">{delivery.note}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
