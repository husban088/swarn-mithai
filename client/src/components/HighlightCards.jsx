import { Flame, Gift, LayoutGrid, ShieldCheck, Droplets, Truck, RefreshCw, Layers } from "lucide-react";
import Reveal from "./Reveal";

const SWEETS = [
  {
    t: "Made Fresh",
    d: "Cooked in small batches with pure ghee and real khoya.",
    i: Flame,
  },
  {
    t: "20 Varieties",
    d: "Barfi, halwa, kalakand, laddu and more, all under one roof.",
    i: LayoutGrid,
  },
  {
    t: "Special Boxes",
    d: "Weddings, birthdays and baby-born boxes at special rates.",
    i: Gift,
  },
  {
    t: "2nd-Day Delivery",
    d: "Delivered on the second day. Timing depends on your state.",
    i: Truck,
  },
];

const AQUA = [
  {
    t: "Purified & Sealed Fresh",
    d: "Multi-stage purified, quality tested and sealed fresh before it leaves us.",
    i: ShieldCheck,
  },
  {
    t: "19 Liter Refill System",
    d: "Refillable 19 L bottles for your home or office dispenser, delivered on repeat.",
    i: RefreshCw,
  },
  {
    t: "Pure Customize Water Bottles",
    d: "500 ml (0.5 L) and 1500 ml (1.5 L) bottles, customized with your own label.",
    i: Droplets,
  },
  {
    t: "Mix Customize Water Bottles",
    d: "Mix 0.5 L and 1.5 L bottles in one customized order.",
    i: Layers,
  },
];

const CSS = `
.hc-card{transition:transform .6s cubic-bezier(.2,.7,.2,1),box-shadow .6s ease,background-color .6s ease,border-color .6s ease}
.hc-ghost{-webkit-text-stroke:1px rgba(11,11,13,.14);color:transparent;transition:all .6s ease}
.hc-card:hover .hc-ghost{-webkit-text-stroke:1px rgba(74,163,240,.7);transform:translateY(-4px) scale(1.06)}
@keyframes hcSheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(420%) skewX(-18deg)}}
.hc-card:hover .hc-sheen{animation:hcSheen 1.1s ease}
@media (prefers-reduced-motion:reduce){.hc-card:hover .hc-sheen{animation:none}}
`;

// Hero ke neeche 4 luxury cards (pure white section)
export default function HighlightCards({ sweets }) {
  const items = sweets ? SWEETS : AQUA;
  return (
    <section id="highlights" className="relative bg-white py-14 sm:py-20">
      <style>{CSS}</style>
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{sweets ? "The Mithai House promise" : "The Apna Pani promise"}</span>
          <h2 className="title-lg mt-3">
            {sweets ? "Made with care, delivered with pride" : "Purity you can taste"}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {items.map((h, k) => (
            <Reveal key={h.t} delay={k * 90} className="h-full">
              <article className="hc-card group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-[1.75rem] border border-royal/10 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(11,11,13,.45)] hover:-translate-y-2 hover:border-royal hover:bg-royal hover:shadow-[0_34px_70px_-30px_rgba(29,127,224,.55)] sm:p-7">
                {/* ghost numeral */}
                <span
                  aria-hidden="true"
                  className="hc-ghost pointer-events-none absolute -right-1 -top-3 select-none font-display text-[6.5rem] font-bold leading-none sm:text-[7.5rem]"
                >
                  {String(k + 1).padStart(2, "0")}
                </span>
                {/* red corner */}
                <span className="pointer-events-none absolute left-0 top-0 h-14 w-14 rounded-br-[2.2rem] bg-gradient-to-br from-[#1d7fe0] to-[#0a3a78] opacity-0 transition duration-500 group-hover:opacity-100" />

                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-royal text-white ring-4 ring-white transition duration-500 group-hover:rotate-[360deg] group-hover:bg-white group-hover:text-royal group-hover:ring-royal">
                  <h.i size={22} />
                </span>

                <h3 className="relative mt-auto pt-10 font-display text-[1.75rem] font-bold leading-tight text-royal transition duration-500 group-hover:text-white">
                  {h.t}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-neutral-600 transition duration-500 group-hover:text-white/75">
                  {h.d}
                </p>

                <span className="relative mt-5 block h-px w-full bg-royal/10 transition duration-500 group-hover:bg-white/20" />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#1d7fe0] via-[#4aa3f0] to-[#0a3a78] transition duration-700 group-hover:scale-x-100" />
                <span className="hc-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
