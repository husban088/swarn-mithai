import { Link } from "react-router-dom";
import {
  ArrowRight,
  Droplets,
  Flame,
  Gift,
  Milk,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Reveal from "./Reveal";
import Tilt from "./Tilt";
import { BrandMark } from "./Logo";

const SWEETS = {
  eyebrow: "About Mithai House",
  title: "Sweets the way your elders made them",
  p1: "Mithai House is the standard we cook to. Every piece is hand rolled in small batches with pure desi ghee, real khoya, whole nuts and saffron, then packed like a gift because that is what it is.",
  p2: "No shortcuts, no artificial flavour and no stale boxes sitting in a warehouse. Cooked fresh, sealed with care and delivered to your door.",
  big: "Since the first batch",
  small: "Handcrafted with patience",
  ring: "PURE DESI GHEE\u00A0\u00A0✦\u00A0\u00A0REAL KHOYA\u00A0\u00A0✦\u00A0\u00A0WHOLE NUTS\u00A0\u00A0✦\u00A0\u00A0SAFFRON\u00A0\u00A0✦\u00A0\u00A0",
  chips: ["Desi ghee", "Real khoya", "Saffron", "Whole nuts"],
  stamp: ["Small", "batch"],
  items: [
    {
      t: "Pure desi ghee",
      d: "Every batch is cooked in it, never oil.",
      i: Flame,
    },
    { t: "Real khoya", d: "Slow reduced from fresh milk.", i: Milk },
    {
      t: "Nuts and saffron",
      d: "Whole nuts, real saffron threads.",
      i: Sparkles,
    },
    { t: "Packed like a gift", d: "Sealed with care, ready to give.", i: Gift },
  ],
  cta: "Read our story",
};

const AQUA = {
  eyebrow: "About Evelyn One",
  title: "Pure water, sealed fresh",
  p1: "Evelyn One is the name families trust for clean drinking water. Every bottle is purified in several stages, tested and sealed before it ever leaves us.",
  p2: "No shortcuts and no old stock sitting in a warehouse. Clean bottles, sealed with care and delivered to your door.",
  big: "Pure, every bottle",
  small: "Tested and sealed fresh",
  ring: "MULTI STAGE PURIFIED\u00A0\u00A0✦\u00A0\u00A0QUALITY TESTED\u00A0\u00A0✦\u00A0\u00A0SEALED FRESH\u00A0\u00A0✦\u00A0\u00A0",
  chips: ["Purified", "Tested", "Sealed", "Fresh"],
  stamp: ["Quality", "checked"],
  items: [
    {
      t: "Multi stage purified",
      d: "Filtered through several stages.",
      i: Droplets,
    },
    {
      t: "Quality tested",
      d: "Checked before every dispatch.",
      i: ShieldCheck,
    },
    { t: "Sealed fresh", d: "Closed tight, opened by you.", i: Sparkles },
    {
      t: "Delivered to you",
      d: "Home and office, on repeat.",
      i: PackageCheck,
    },
  ],
  cta: "Read our story",
};

const CSS = `
.ab-spin{animation:abSpin 38s linear infinite}
.ab-spin-rev{animation:abSpin 60s linear infinite reverse}
@keyframes abSpin{to{transform:rotate(360deg)}}
@keyframes abFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.ab-chip{animation:abFloat 6s ease-in-out infinite;transition:background-color .5s ease,color .5s ease,border-color .5s ease,transform .5s cubic-bezier(.2,.7,.2,1)}
.ab-chip:hover{animation-play-state:paused;transform:scale(1.08);background:#fff;color:#0b0b0d;border-color:#fff}
@keyframes abPulse{0%{transform:scale(.9);opacity:.55}100%{transform:scale(1.35);opacity:0}}
.ab-pulse{animation:abPulse 3.6s ease-out infinite}
.ab-pulse.d2{animation-delay:1.8s}
@keyframes abSheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(420%) skewX(-18deg)}}
.ab-item:hover .ab-sheen{animation:abSheen 1.1s ease}
.ab-item .ab-fill{transform:scaleY(0);transform-origin:bottom;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.ab-item:hover .ab-fill,.ab-item:focus-within .ab-fill{transform:scaleY(1)}
.ab-item .ab-t{transition:color .5s ease}
.ab-item:hover .ab-t{color:#fff}
.ab-item:hover .ab-d{color:rgba(234,244,255,.78)}
.ab-item .ab-d{transition:color .5s ease}
.ab-item:hover .ab-ico{background:#fff;color:#0b0b0d;transform:rotate(-8deg) scale(1.08)}
.ab-ico{transition:background-color .5s ease,color .5s ease,transform .5s cubic-bezier(.2,.7,.2,1)}
.ab-line{background:linear-gradient(90deg,#4aa3f0,#eaf4ff 50%,#4aa3f0);background-size:200% 100%;animation:abLine 4s linear infinite}
@keyframes abLine{to{background-position:-200% 0}}
.ab-cta .ab-arrow{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.ab-cta:hover .ab-arrow{transform:translateX(5px)}
@media (prefers-reduced-motion:reduce){
  .ab-spin,.ab-spin-rev,.ab-chip,.ab-pulse,.ab-line{animation:none}
  .ab-item:hover .ab-sheen{animation:none}
}
`;

export default function AboutTeaser({ sweets = true }) {
  const c = sweets ? SWEETS : AQUA;
  const chipPos = [
    "left-3 top-[14%] sm:left-5",
    "right-3 top-[22%] sm:right-5 [animation-delay:-1.5s]",
    "left-3 bottom-[22%] sm:left-5 [animation-delay:-3s]",
    "right-3 bottom-[14%] sm:right-5 [animation-delay:-4.5s]",
  ];

  return (
    <section
      id="story"
      className="relative overflow-hidden bg-white py-16 sm:py-24"
    >
      <style>{CSS}</style>

      {/* soft background glow + fine hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-champ-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-champ-100/80 blur-3xl"
      />
      <div className="hairline absolute inset-x-0 top-0" />

      <div className="container-x relative grid items-center gap-12 sm:gap-16 lg:grid-cols-[1fr_1.05fr]">
        {/* ============ LEFT: rotating seal stage ============ */}
        <Reveal>
          <div className="relative mx-auto w-full max-w-[26rem] sm:max-w-md lg:max-w-none">
            <Tilt className="group aspect-square w-full rounded-[2.25rem] border border-champ-300/60 bg-royal p-2.5 shadow-[0_40px_90px_-40px_rgba(10,58,120,.7)] sm:rounded-[2.75rem] sm:p-3">
              <div className="grain relative h-full w-full overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-royal-light via-royal to-royal-deep sm:rounded-[2.3rem]">
                {/* inner frame */}
                <div className="absolute inset-3 rounded-[1.4rem] border border-champ-300/30 sm:inset-5 sm:rounded-[1.9rem]" />

                {/* pulse rings */}
                <div className="absolute inset-0 grid place-items-center">
                  <span className="ab-pulse absolute h-[52%] w-[52%] rounded-full border border-champ-300/40" />
                  <span className="ab-pulse d2 absolute h-[52%] w-[52%] rounded-full border border-champ-300/30" />
                </div>

                {/* rotating text ring */}
                <svg
                  viewBox="0 0 400 400"
                  aria-hidden="true"
                  className="ab-spin absolute inset-[6%] h-[88%] w-[88%]"
                >
                  <defs>
                    <path
                      id="abRingPath"
                      d="M200,200 m-165,0 a165,165 0 1,1 330,0 a165,165 0 1,1 -330,0"
                    />
                  </defs>
                  <text
                    fill="#bfdcfa"
                    fontSize="17"
                    fontWeight="700"
                    letterSpacing="5.2"
                    style={{ fontFamily: "Manrope, system-ui, sans-serif" }}
                  >
                    <textPath href="#abRingPath" textLength="1030">
                      {c.ring}
                    </textPath>
                  </text>
                </svg>

                {/* counter rotating dotted ring */}
                <svg
                  viewBox="0 0 400 400"
                  aria-hidden="true"
                  className="ab-spin-rev absolute inset-[22%] h-[56%] w-[56%]"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="190"
                    fill="none"
                    stroke="#4aa3f0"
                    strokeOpacity=".55"
                    strokeWidth="2"
                    strokeDasharray="2 12"
                    strokeLinecap="round"
                  />
                </svg>

                {/* centre: logo + line */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="mx-auto w-fit">
                      <BrandMark size={sweets ? 74 : 92} />
                    </div>
                    <span className="ab-line mt-3 block h-px w-20 rounded-full" />
                    <p className="mt-3 max-w-[11rem] font-display text-[1.35rem] font-bold leading-[1.1] text-champ-100 sm:text-[1.7rem]">
                      {c.big}
                    </p>
                    <p className="mt-1.5 text-[10px] font-semibold tracking-[0.18em] text-champ-300 sm:text-[11px]">
                      {c.small}
                    </p>
                  </div>
                </div>

                {/* floating ingredient chips */}
                {c.chips.map((t, k) => (
                  <span
                    key={t}
                    className={`ab-chip absolute z-10 cursor-default rounded-full border border-champ-300/40 bg-white/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-champ-100 backdrop-blur-md sm:px-4 sm:py-2 sm:text-xs ${chipPos[k]}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Tilt>

            {/* round stamp, half over the corner */}
            <div className="absolute -bottom-5 right-2 z-20 sm:-bottom-6 sm:right-5">
              <div className="grid h-24 w-24 place-items-center rounded-full border border-champ-300 bg-white shadow-[0_18px_40px_-14px_rgba(10,58,120,.55)] sm:h-28 sm:w-28">
                <div className="grid h-[84%] w-[84%] place-items-center rounded-full border border-dashed border-royal/40 text-center">
                  <p className="font-display text-lg font-bold leading-none text-royal sm:text-xl">
                    {c.stamp[0]}
                    <span className="mt-1 block text-champ-600">
                      {c.stamp[1]}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ============ RIGHT: story + ingredients ============ */}
        <Reveal delay={120}>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="title-lg mt-3 max-w-xl">{c.title}</h2>
          <span className="ab-line mt-5 block h-[2px] w-24 rounded-full" />

          <p className="mt-6 max-w-xl leading-relaxed text-neutral-600">
            {c.p1}
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-neutral-600">
            {c.p2}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {c.items.map((it) => {
              const Ico = it.i;
              return (
                <article
                  key={it.t}
                  className="ab-item group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-champ-200 bg-white p-4 shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-royal hover:shadow-[0_26px_50px_-26px_rgba(29,127,224,.6)] sm:p-5"
                >
                  <span
                    aria-hidden="true"
                    className="ab-fill absolute inset-0 bg-royal"
                  />
                  <span
                    aria-hidden="true"
                    className="ab-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-[140%] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  />
                  <span className="ab-ico relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-champ-300 bg-champ-100 text-champ-600">
                    <Ico size={20} />
                  </span>
                  <div className="relative min-w-0">
                    <h3 className="ab-t font-display text-xl font-bold leading-tight text-royal">
                      {it.t}
                    </h3>
                    <p className="ab-d mt-1 text-[13px] leading-relaxed text-neutral-600">
                      {it.d}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <Link to="/about" className="ab-cta btn-gold mt-9">
            {c.cta} <ArrowRight size={16} className="ab-arrow" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
