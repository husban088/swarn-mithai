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
    <section className="container-x py-20">
      <Reveal>
        <div className="grain glow-border relative overflow-hidden rounded-[2.5rem] bg-royal p-6 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-glow rounded-full bg-champ-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 animate-glow rounded-full bg-gold-500/30 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="eyebrow !text-champ-300">Celebrations</span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                Special rates for <span className="gold-text">every event</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-champ-100/80">
                {special.text} Choose your favourites from 20 varieties and we
                pack them in elegant special boxes.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {OCCASIONS.map(({ label, icon: Icon, text }, i) => (
                  <div
                    key={label}
                    style={{ animationDelay: `${i * 120}ms` }}
                    className="group animate-fadeUp rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur transition duration-500 hover:-translate-y-2 hover:border-champ-300/60 hover:bg-white/[0.1] hover:shadow-2xl hover:shadow-black/30"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-champ-300/40 text-champ-300 transition duration-500 group-hover:rotate-12 group-hover:bg-champ-400 group-hover:text-royal">
                      <Icon size={20} />
                    </span>
                    <div className="mt-3 font-display text-2xl font-bold text-champ-100">
                      {label}
                    </div>
                    <div className="mt-0.5 text-xs leading-snug text-champ-100/60">
                      {text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={to} className="btn-champ !px-8 !py-3.5">
                  Order the Special Box <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn-ghost-light !px-8 !py-3.5">
                  Plan my event
                </Link>
              </div>
            </div>

            {/* Price badge */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute inset-0 animate-glow rounded-full bg-champ-400/30 blur-3xl" />
              <div className="relative aspect-square">
                <svg
                  viewBox="0 0 400 400"
                  className="absolute inset-0 animate-spinSlow"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="evRing"
                      d="M200,200 m-172,0 a172,172 0 1,1 344,0 a172,172 0 1,1 -344,0"
                    />
                  </defs>
                  <circle
                    cx="200"
                    cy="200"
                    r="192"
                    fill="none"
                    stroke="#4aa3f0"
                    strokeOpacity=".5"
                    strokeWidth="1.5"
                  />
                  <text
                    fontFamily="Manrope, sans-serif"
                    fontSize="17"
                    fontWeight="700"
                    letterSpacing="5.5"
                    fill="#cfe3fa"
                  >
                    <textPath href="#evRing">
                      SPECIAL BOX · 16 PIECES · WEDDINGS · BIRTHDAYS · BABY BORN
                      ·
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-[13%] grid place-items-center rounded-full border border-champ-300/40 bg-gradient-to-br from-[#0a3a78]/70 to-[#060607]/80 text-center shadow-2xl shadow-black/40 backdrop-blur transition duration-700 hover:scale-105">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-champ-300">
                      Special box
                    </div>
                    <div className="gold-text font-display text-7xl font-bold leading-none sm:text-8xl">
                      ${special.box.price}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-champ-100">
                      {special.box.pieces} pieces
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-champ-100/80">
            <span className="inline-flex items-center gap-2 font-semibold text-champ-100">
              <Truck size={16} className="text-champ-300" />
              {delivery.title}
            </span>
            <span>{delivery.note}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
