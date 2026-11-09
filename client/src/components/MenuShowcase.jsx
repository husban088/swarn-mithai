import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { VARIETIES } from "../config";

// Har mithai ka group + chhota sa taste note (names config.js ke VARIETIES jaise hi hain)
const INFO = {
  "Khoya Barfi": ["Barfi", "Slow-cooked khoya, pure ghee"],
  "Almond Barfi": ["Barfi", "Roasted almonds, silky milk fudge"],
  "Pistachio Barfi": ["Barfi", "Green pistachio, rich and nutty"],
  "Mango Barfi": ["Barfi", "Sun-ripe mango, soft and fruity"],
  "Chocolate Barfi": ["Barfi", "Deep cocoa meets creamy khoya"],
  "Coffee Barfi": ["Barfi", "Bold coffee, smooth milk finish"],
  "Orange Barfi": ["Barfi", "Bright citrus, gentle sweetness"],
  "Besan Barfi": ["Barfi", "Roasted gram flour, ghee aroma"],
  "Kaju Katli": ["Classic", "Silky cashew fudge, silver touch"],
  "Gulab Jamun": ["Classic", "Warm khoya dumplings in rose syrup"],
  Laddu: ["Classic", "Golden hand-rolled festive pearls"],
  Kalakand: ["Milk", "Grainy milk sweet, cardamom kissed"],
  "Pink Kalakand": ["Milk", "Rose-tinted, soft and melting"],
  "Milk Cake": ["Milk", "Caramelised milk, slow-reduced"],
  "Habshi Halwa": ["Halwa", "Dark, dense, deeply ghee-rich"],
  "Khoya Pera": ["Classic", "Classic khoya bites, cardamom scent"],
  "Gajar Halwa": ["Halwa", "Winter carrots, milk and nuts"],
  "Coconut Barfi": ["Barfi", "Fresh coconut, light and creamy"],
  Pateesa: ["Classic", "Flaky threads that melt away"],
  "Pineapple Barfi": ["Barfi", "Tropical pineapple, sweet and tangy"],
};

const GROUPS = ["All", "Barfi", "Classic", "Milk", "Halwa"];

const css = `
@property --mn-a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes mn-spin { to { --mn-a: 360deg; } }
@keyframes mn-rise { from { opacity: 0; transform: translateY(26px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes mn-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
@keyframes mn-pulse { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .95; transform: scale(1.12); } }
@keyframes mn-ring { to { transform: rotate(360deg); } }
@keyframes mn-shine { from { transform: translateX(-130%) skewX(-18deg); } to { transform: translateX(260%) skewX(-18deg); } }

.mn-card {
  --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 50%;
  position: relative;
  display: block;
  height: 100%;
  border-radius: 1.5rem;
  background: linear-gradient(160deg, rgba(255,255,255,.09), rgba(255,255,255,.02));
  border: 1px solid rgba(255,255,255,.10);
  contain: layout paint;
  transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .5s, background .5s, border-color .5s;
  animation: mn-rise .7s cubic-bezier(.2,.8,.2,1) both;
  overflow: hidden;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
}
.mn-card::before {
  content: "";
  position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
  background: conic-gradient(from var(--mn-a), transparent 0 55%, #3d9bea 75%, #bfdcfa 88%, transparent 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .5s; pointer-events: none; z-index: 2;
}
.mn-card::after {
  content: "";
  position: absolute; inset: 0; border-radius: inherit; z-index: 0; pointer-events: none;
  background: radial-gradient(260px circle at var(--mx) var(--my), rgba(61,155,234,.30), transparent 65%);
  opacity: 0; transition: opacity .5s;
}
.mn-card:hover, .mn-card:focus-visible {
  background: linear-gradient(160deg, rgba(61,155,234,.20), rgba(255,255,255,.04));
  border-color: rgba(140,195,245,.45);
  box-shadow: 0 30px 60px -20px rgba(29,127,224,.55), 0 0 0 1px rgba(140,195,245,.15);
  outline: none;
}
.mn-card:hover::before, .mn-card:focus-visible::before { opacity: 1; animation: mn-spin 4s linear infinite; }
.mn-card:hover::after, .mn-card:focus-visible::after { opacity: 1; }
.mn-card:active { transform: perspective(900px) scale(.97); }

.mn-shine {
  position: absolute; top: 0; bottom: 0; left: 0; width: 38%; z-index: 1; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
  transform: translateX(-130%) skewX(-18deg);
}
.mn-card:hover .mn-shine { animation: mn-shine 1.1s ease; }

.mn-num { position: relative; display: grid; place-items: center; width: 3.4rem; height: 3.4rem; flex-shrink: 0; }
.mn-num::before {
  content: ""; position: absolute; inset: 0; border-radius: 9999px;
  border: 1.5px dashed rgba(140,195,245,.55);
  transition: border-color .5s;
}
.mn-card:hover .mn-num::before { animation: mn-ring 9s linear infinite; border-color: #8cc3f5; }
.mn-num span { transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.mn-card:hover .mn-num span { transform: scale(1.18); }

.mn-chip {
  position: relative; overflow: hidden;
  transition: transform .3s, background .3s, color .3s, border-color .3s, box-shadow .3s;
}
.mn-chip:hover { transform: translateY(-2px); }

.mn-orb { animation: mn-float 9s ease-in-out infinite; }
.mn-glow { animation: mn-pulse 6s ease-in-out infinite; }

@media (max-width: 1023px) { .mn-orb, .mn-glow { animation: none; } }
@media (prefers-reduced-motion: reduce) {
  .mn-card, .mn-orb, .mn-glow, .mn-card::before, .mn-card:hover .mn-num::before, .mn-card:hover .mn-shine { animation: none !important; }
  .mn-card { transition: none; }
}
`;

function VarietyCard({ v, n, i }) {
  const [group, note] = INFO[v] || ["Classic", "Handcrafted in small batches"];

  // Mouse ke hisaab se halka 3D tilt + spotlight (touch par ye nahi chalta, tap pe sirf scale)
  const move = (e) => {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const leave = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <Link
      to={`/shop?q=${encodeURIComponent(v)}`}
      onPointerMove={move}
      onPointerLeave={leave}
      className="mn-card group p-4 sm:p-5"
      style={{ animationDelay: `${Math.min(i, 14) * 55}ms` }}
      aria-label={`${v} - view in shop`}
    >
      <span className="mn-shine" />

      {/* bada watermark number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 -right-2 z-0 select-none font-display text-[6.5rem] font-bold leading-none text-white/[0.05] transition duration-700 group-hover:-translate-y-2 group-hover:text-champ-300/[0.13] sm:text-[7.5rem]"
      >
        {String(n).padStart(2, "0")}
      </span>

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="mn-num font-display text-xl font-bold text-champ-200">
            <span>{String(n).padStart(2, "0")}</span>
          </span>
          <span className="rounded-full border border-champ-300/30 bg-champ-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-champ-200 transition duration-500 group-hover:border-champ-300 group-hover:bg-champ-400 group-hover:text-royal-deep">
            {group}
          </span>
        </div>

        <h3 className="mt-5 break-words font-display text-[1.65rem] font-bold leading-[1.05] text-white transition duration-500 group-hover:text-champ-100 sm:text-3xl">
          {v}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-champ-100/60 transition duration-500 group-hover:text-champ-100/90">
          {note}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-champ-300">
            View in shop
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-champ-300 transition-all duration-500 group-hover:w-full" />
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-champ-300/40 text-champ-200 transition duration-500 group-hover:-rotate-45 group-hover:border-transparent group-hover:bg-champ-400 group-hover:text-royal-deep group-hover:shadow-lg group-hover:shadow-champ-400/50">
            <ArrowRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MenuShowcase() {
  const [group, setGroup] = useState("All");

  const items = useMemo(
    () =>
      VARIETIES.map((v, idx) => ({ v, n: idx + 1 })).filter(
        ({ v }) => group === "All" || (INFO[v] || [])[0] === group,
      ),
    [group],
  );
  const count = (g) =>
    g === "All"
      ? VARIETIES.length
      : VARIETIES.filter((v) => (INFO[v] || [])[0] === g).length;

  return (
    <section className="relative isolate overflow-hidden bg-royal-deep py-16 sm:py-24">
      <style>{css}</style>

      {/* background decor */}
      <div className="mn-glow pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-champ-500/25 blur-3xl" />
      <div
        className="mn-glow pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-champ-400/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div className="mn-orb pointer-events-none absolute right-[8%] top-16 hidden h-24 w-24 rounded-full border border-champ-300/30 lg:block" />
      <div
        className="mn-orb pointer-events-none absolute bottom-24 left-[6%] hidden h-14 w-14 rounded-full border border-champ-300/20 lg:block"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #8cc3f5 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="hairline absolute inset-x-0 top-0" />

      <div className="container-x relative">
        {/* ---------- heading ---------- */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.35em] text-champ-300">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-champ-300" />
            Our menu
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-champ-300" />
          </span>
          <h2 className="mt-4 font-display text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            20 signature{" "}
            <span className="bg-gradient-to-r from-champ-300 via-white to-champ-400 bg-clip-text text-transparent">
              varieties
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-champ-100/70 sm:text-base">
            Tap any mithai to see it in the shop.
          </p>
        </Reveal>

        {/* ---------- filter chips ---------- */}
        <Reveal delay={120} className="mt-9 sm:mt-11">
          <div
            role="tablist"
            aria-label="Filter mithai"
            className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {GROUPS.map((g) => {
              const on = group === g;
              return (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setGroup(g)}
                  className={`mn-chip flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold tracking-wide sm:px-5 sm:py-2.5 sm:text-sm ${
                    on
                      ? "border-transparent bg-gradient-to-r from-champ-400 to-champ-600 text-white shadow-lg shadow-champ-500/40"
                      : "border-white/15 bg-white/[0.04] text-champ-100/80 hover:border-champ-300/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {on && <Sparkles size={13} />}
                  {g}
                  <span
                    className={`rounded-full px-1.5 text-[11px] ${on ? "bg-white/25" : "bg-white/10 text-champ-200"}`}
                  >
                    {count(g)}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ---------- cards ---------- */}
        <div
          key={group}
          className="mt-10 grid grid-cols-1 gap-3.5 min-[460px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {items.map(({ v, n }, i) => (
            <VarietyCard key={v} v={v} n={n} i={i} />
          ))}
        </div>

        {/* ---------- bottom CTA ---------- */}
        <Reveal className="mt-12 text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 rounded-full border border-champ-300/40 bg-white/[0.05] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition duration-500 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-r hover:from-champ-400 hover:to-champ-600 hover:shadow-xl hover:shadow-champ-500/40"
          >
            Browse the full shop
            <ArrowUpRight
              size={17}
              className="transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
