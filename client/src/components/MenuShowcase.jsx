import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

/* White luxury menu: ivory-white background, ink typography, royal-blue accents.
   Sab animations CSS se hain (halke), reduced-motion par band ho jati hain. */
const css = `
@property --mn-a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes mn-spin { to { --mn-a: 360deg; } }
@keyframes mn-rise { from { opacity: 0; transform: translateY(28px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes mn-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
@keyframes mn-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-22px,0) scale(1.1); } }
@keyframes mn-ring { to { transform: rotate(360deg); } }
@keyframes mn-shine { from { transform: translateX(-130%) skewX(-18deg); } to { transform: translateX(300%) skewX(-18deg); } }
@keyframes mn-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes mn-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes mn-gem { from { transform: rotate(45deg) scale(0); } to { transform: rotate(45deg) scale(1); } }
@keyframes mn-sheen { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }

.mn-sec { background: #fff; }

.mn-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.mn-scroll::-webkit-scrollbar { display: none; }

/* heading */
.mn-ghost {
  font-family: "Cormorant Garamond", Georgia, serif; font-weight: 700; line-height: .8;
  color: transparent; -webkit-text-stroke: 1.5px rgba(29,127,224,.09);
  user-select: none; pointer-events: none;
}
.mn-grad {
  background: linear-gradient(100deg, #135fb8, #3d9bea 30%, #0B0B0D 52%, #3d9bea 74%, #135fb8);
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: mn-sheen 7s linear infinite;
}
.mn-rule-l, .mn-rule-r { height: 1px; width: 3.5rem; transform-origin: center; animation: mn-draw 1s .2s cubic-bezier(.2,.8,.2,1) both; }
.mn-rule-l { background: linear-gradient(90deg, transparent, #1d7fe0); transform-origin: right; }
.mn-rule-r { background: linear-gradient(270deg, transparent, #1d7fe0); transform-origin: left; }
.mn-gem { width: 7px; height: 7px; background: #1d7fe0; transform: rotate(45deg); animation: mn-gem .7s .9s cubic-bezier(.3,1.6,.5,1) both; }

/* marquee */
.mn-marq { -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.mn-track { display: flex; width: max-content; animation: mn-marquee 55s linear infinite; }
.mn-marq:hover .mn-track { animation-play-state: paused; }
.mn-word { transition: color .4s, transform .4s; }
.mn-word:hover { color: #1d7fe0; transform: translateY(-2px); }

/* filter */
.mn-seg { background: rgba(255,255,255,.9); border: 1px solid rgba(11,11,13,.08); box-shadow: 0 10px 30px -14px rgba(19,95,184,.35); }
.mn-pill {
  pointer-events: none;
  background: linear-gradient(120deg, #135fb8, #1d7fe0 55%, #3d9bea);
  box-shadow: 0 10px 22px -8px rgba(29,127,224,.65);
  transition: left .55s cubic-bezier(.3,1.2,.4,1), top .45s cubic-bezier(.3,1.2,.4,1), width .55s cubic-bezier(.3,1.2,.4,1), height .45s ease;
}
.mn-tab { transition: color .35s, transform .3s; }
.mn-tab:hover { transform: translateY(-1px); }

/* card */
.mn-card {
  --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 50%;
  position: relative; display: block; height: 100%; min-height: 15.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(165deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid rgba(11,11,13,.08);
  box-shadow: 0 1px 2px rgba(11,11,13,.04), 0 14px 30px -22px rgba(11,11,13,.25);
  transform: perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .5s, background .5s, border-color .5s;
  animation: mn-rise .75s cubic-bezier(.2,.8,.2,1) both;
  overflow: hidden; isolation: isolate; contain: layout paint;
  -webkit-tap-highlight-color: transparent;
}
.mn-card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
  background: conic-gradient(from var(--mn-a), transparent 0 50%, #3d9bea 72%, #135fb8 86%, transparent 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .5s; pointer-events: none; z-index: 3;
}
.mn-card::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: 0; pointer-events: none;
  background: radial-gradient(280px circle at var(--mx) var(--my), rgba(61,155,234,.20), transparent 65%);
  opacity: 0; transition: opacity .5s;
}
.mn-card:hover, .mn-card:focus-visible {
  background: linear-gradient(165deg, #ffffff 0%, #eef6ff 100%);
  border-color: rgba(29,127,224,.28);
  box-shadow: 0 34px 60px -26px rgba(19,95,184,.5), 0 0 0 1px rgba(29,127,224,.08);
  outline: none;
}
.mn-card:hover::before, .mn-card:focus-visible::before { opacity: 1; animation: mn-spin 4s linear infinite; }
.mn-card:hover::after, .mn-card:focus-visible::after { opacity: 1; }
.mn-card:active { transform: perspective(1000px) scale(.975); }

.mn-bar {
  position: absolute; left: 0; right: 0; top: 0; height: 3px; z-index: 2;
  background: linear-gradient(90deg, #135fb8, #3d9bea, #bfdcfa);
  transform: scaleX(0); transform-origin: left; transition: transform .6s cubic-bezier(.2,.8,.2,1);
}
.mn-card:hover .mn-bar, .mn-card:focus-visible .mn-bar { transform: scaleX(1); }

.mn-shine {
  position: absolute; top: 0; bottom: 0; left: 0; width: 34%; z-index: 1; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(61,155,234,.18), transparent);
  transform: translateX(-130%) skewX(-18deg);
}
.mn-card:hover .mn-shine { animation: mn-shine 1.15s ease; }

.mn-num {
  position: relative; display: grid; place-items: center; width: 3.2rem; height: 3.2rem; flex-shrink: 0;
  border-radius: 9999px; background: #fff; box-shadow: 0 6px 16px -8px rgba(19,95,184,.5);
  transition: background .5s, box-shadow .5s;
}
.mn-num::before {
  content: ""; position: absolute; inset: -5px; border-radius: 9999px;
  border: 1.5px dashed rgba(29,127,224,.45); transition: border-color .5s;
}
.mn-card:hover .mn-num { background: linear-gradient(135deg, #1d7fe0, #3d9bea); box-shadow: 0 10px 22px -8px rgba(29,127,224,.8); }
.mn-card:hover .mn-num::before { animation: mn-ring 9s linear infinite; border-color: #3d9bea; }
.mn-num b { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.25rem; font-weight: 700; color: #135fb8; transition: color .4s, transform .5s cubic-bezier(.2,.8,.2,1); }
.mn-card:hover .mn-num b { color: #fff; transform: scale(1.15); }

.mn-water {
  font-family: "Cormorant Garamond", Georgia, serif; font-weight: 700; line-height: .8;
  color: transparent; -webkit-text-stroke: 1.2px rgba(29,127,224,.13);
  transition: -webkit-text-stroke-color .6s, transform .8s cubic-bezier(.2,.8,.2,1);
}
.mn-card:hover .mn-water { -webkit-text-stroke-color: rgba(29,127,224,.42); transform: translate(-6px,-10px) scale(1.05); }

.mn-tag {
  border: 1px solid rgba(29,127,224,.25); background: rgba(234,244,255,.8); color: #135fb8;
  transition: background .5s, color .5s, border-color .5s;
}
.mn-card:hover .mn-tag { background: #0B0B0D; color: #fff; border-color: #0B0B0D; }

.mn-title { -webkit-text-stroke: .45px currentColor; }
.mn-hr { height: 1px; width: 2rem; background: linear-gradient(90deg, #1d7fe0, transparent); transition: width .6s cubic-bezier(.2,.8,.2,1); }
.mn-card:hover .mn-hr { width: 4.5rem; }

.mn-go {
  border: 1px solid rgba(29,127,224,.3); color: #135fb8; background: #fff;
  transition: transform .5s cubic-bezier(.2,.8,.2,1), background .5s, color .5s, border-color .5s, box-shadow .5s;
}
.mn-card:hover .mn-go { transform: rotate(-45deg); background: linear-gradient(135deg, #135fb8, #3d9bea); color: #fff; border-color: transparent; box-shadow: 0 10px 20px -6px rgba(29,127,224,.7); }

.mn-orb { animation: mn-float 9s ease-in-out infinite; }
.mn-blob { animation: mn-drift 16s ease-in-out infinite; }

.mn-cta { position: relative; overflow: hidden; }
.mn-cta::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  transform: translateX(-130%) skewX(-18deg);
}
.mn-cta:hover::before { animation: mn-shine 1s ease; }

@media (max-width: 1023px) { .mn-orb, .mn-blob { animation: none; } }
@media (max-width: 639px) { .mn-card { min-height: 0; } }
@media (prefers-reduced-motion: reduce) {
  .mn-card, .mn-orb, .mn-blob, .mn-grad, .mn-track, .mn-card::before,
  .mn-card:hover .mn-num::before, .mn-card:hover .mn-shine, .mn-cta:hover::before { animation: none !important; }
  .mn-card, .mn-pill, .mn-water { transition: none; }
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
    el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 9}deg`);
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
      className="mn-card group p-5 sm:p-6"
      style={{ animationDelay: `${Math.min(i, 14) * 55}ms` }}
      aria-label={`${v} - view in shop`}
    >
      <span className="mn-bar" />
      <span className="mn-shine" />

      {/* bada outline number (watermark) */}
      <span
        aria-hidden="true"
        className="mn-water pointer-events-none absolute -bottom-4 -right-1 z-0 select-none text-[6.5rem] sm:text-[7.5rem]"
      >
        {String(n).padStart(2, "0")}
      </span>

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="mn-num">
            <b>{String(n).padStart(2, "0")}</b>
          </span>
          <span className="mn-tag rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.16em]">
            {group}
          </span>
        </div>

        <h3 className="mn-title mt-5 break-words font-display text-[1.85rem] font-bold leading-[1.04] text-royal transition duration-500 group-hover:text-champ-600 sm:text-[2.15rem]">
          {v}
        </h3>
        <span className="mn-hr mt-3 block" />
        <p className="mt-3 text-[14px] font-semibold leading-snug text-neutral-600 transition duration-500 group-hover:text-neutral-800 sm:text-[15px]">
          {note}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="relative text-[12px] font-extrabold uppercase tracking-[0.18em] text-royal">
            View in shop
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-champ-500 transition-all duration-500 group-hover:w-full" />
          </span>
          <span className="mn-go grid h-10 w-10 shrink-0 place-items-center rounded-full">
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

  // Sliding filter pill: active tab ke neeche chalta hai
  const tabs = useRef({});
  const [pill, setPill] = useState({ l: 0, t: 0, w: 0, h: 0, on: false });
  const place = () => {
    const el = tabs.current[group];
    if (el)
      setPill({
        l: el.offsetLeft,
        t: el.offsetTop,
        w: el.offsetWidth,
        h: el.offsetHeight,
        on: true,
      });
  };
  useLayoutEffect(place, [group]);
  useEffect(() => {
    window.addEventListener("resize", place);
    const t = setTimeout(place, 400); // fonts load hone ke baad dobara naap
    return () => {
      window.removeEventListener("resize", place);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);
  const pick = (g) => setGroup(g);

  const marquee = [...VARIETIES, ...VARIETIES];

  return (
    <section className="mn-sec relative isolate overflow-hidden overflow-clip py-14 sm:py-24">
      <style>{css}</style>

      {/* ---------- background decor (sab halka, white bg ke upar) ---------- */}
      <div className="mn-blob pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-champ-200/35 blur-3xl sm:h-[26rem] sm:w-[26rem]" />
      <div
        className="mn-blob pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-champ-100 blur-3xl"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(29,127,224,.16) 1px, transparent 0)",
          backgroundSize: "30px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)",
        }}
      />
      <div className="mn-orb pointer-events-none absolute right-[7%] top-20 hidden h-24 w-24 rounded-full border border-champ-300/50 lg:block" />
      <div
        className="mn-orb pointer-events-none absolute bottom-28 left-[5%] hidden h-14 w-14 rounded-full border border-champ-300/40 lg:block"
        style={{ animationDelay: "3s" }}
      />
      <div className="hairline absolute inset-x-0 top-0" />

      <div className="container-x relative">
        {/* ---------- heading ---------- */}
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <span
            aria-hidden="true"
            className="mn-ghost absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-[52%] text-[11rem] sm:text-[17rem] lg:text-[20rem]"
          >
            {VARIETIES.length}
          </span>
          <span className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-champ-500">
            <span className="mn-rule-l" />
            <Sparkles size={13} />
            Our menu
            <Sparkles size={13} />
            <span className="mn-rule-r" />
          </span>
          <h2 className="mt-4 font-display text-5xl font-bold leading-[0.95] text-royal sm:text-6xl lg:text-7xl">
            {VARIETIES.length} signature{" "}
            <span className="mn-grad">varieties</span>
          </h2>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="mn-rule-l" />
            <span className="mn-gem" />
            <span className="mn-rule-r" />
          </div>
          <p className="mx-auto mt-5 max-w-md text-[15px] font-semibold text-neutral-700 sm:text-lg">
            Tap any mithai to see it in the shop.
          </p>
        </Reveal>

        {/* ---------- marquee ---------- */}
        <Reveal delay={80} className="mt-8 sm:mt-10">
          <div className="mn-marq overflow-hidden py-2" aria-hidden="true">
            <div className="mn-track">
              {marquee.map((v, k) => (
                <span
                  key={k}
                  className="mn-word flex shrink-0 items-center gap-5 pr-5 font-display text-2xl font-bold text-royal/55 sm:gap-7 sm:pr-7 sm:text-3xl"
                >
                  {v}
                  <span className="h-1.5 w-1.5 rotate-45 bg-champ-400" />
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- filter (sliding pill) ---------- */}
        <Reveal delay={120} className="mt-7 sm:mt-9">
          <div className="flex justify-center">
            <div
              role="tablist"
              aria-label="Filter mithai"
              className="mn-seg relative flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-[1.6rem] p-1 sm:gap-1 sm:rounded-full sm:p-1.5"
            >
              <span
                aria-hidden="true"
                className="mn-pill absolute left-0 top-0 rounded-full"
                style={{
                  left: pill.l,
                  top: pill.t,
                  width: pill.w,
                  height: pill.h,
                  opacity: pill.on ? 1 : 0,
                }}
              />
              {GROUPS.map((g) => {
                const on = group === g;
                return (
                  <button
                    key={g}
                    ref={(el) => {
                      tabs.current[g] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => pick(g)}
                    className={`mn-tab relative z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[11.5px] font-bold tracking-wide min-[400px]:px-3.5 min-[400px]:text-[13px] sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm ${
                      on ? "text-white" : "text-neutral-600 hover:text-royal"
                    }`}
                  >
                    {g}
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-extrabold transition-colors duration-300 sm:text-[11px] ${on ? "bg-white/25 text-white" : "bg-champ-100 text-champ-600"}`}
                    >
                      {count(g)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* ---------- cards ---------- */}
        <div
          key={group}
          className="mt-9 grid grid-cols-1 gap-3.5 min-[520px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {items.map(({ v, n }, i) => (
            <VarietyCard key={v} v={v} n={n} i={i} />
          ))}
        </div>

        {/* ---------- bottom CTA ---------- */}
        <Reveal className="mt-12 text-center sm:mt-14">
          <Link
            to="/shop"
            className="mn-cta group inline-flex items-center gap-3 rounded-full bg-royal px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-xl shadow-royal/20 transition duration-500 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-champ-600 hover:to-champ-400 hover:shadow-2xl hover:shadow-champ-500/40"
          >
            Browse the full shop
            <ArrowUpRight
              size={17}
              className="transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>
      <div className="hairline absolute inset-x-0 bottom-0" />
    </section>
  );
}
