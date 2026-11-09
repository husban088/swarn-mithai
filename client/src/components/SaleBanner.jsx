import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Reveal from "./Reveal";
import { useGeo, useShop } from "../store";

/* ------------------------------------------------------------------ */
/* Sale helpers: admin jo % lagata hai wo server se product.sale_percent */
/* me aata hai. Cart / checkout / order sab discounted price use karte  */
/* hain (server hi final price banata hai).                            */
/* ------------------------------------------------------------------ */
export function useSale() {
  const { products } = useShop();
  return useMemo(() => {
    const on = products.filter((p) => Number(p.sale_percent) > 0);
    if (!on.length) return { active: false, count: 0, total: products.length };
    const pcts = on.map((p) => Number(p.sale_percent));
    const max = Math.max(...pcts);
    const min = Math.min(...pcts);
    return {
      active: true,
      count: on.length,
      total: products.length,
      max,
      min,
      same: max === min,
      all: on.length === products.length,
    };
  }, [products]);
}

// Product image ke upar "-20%" badge
export function SaleBadge({ p, className = "" }) {
  const pct = Number(p?.sale_percent) || 0;
  if (!pct) return null;
  return (
    <span
      className={`sb-pulse inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[#4aa3f0] to-[#0a3a78] px-3 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-lg shadow-black/30 ${className}`}
    >
      <style>{CSS}</style>
      <BadgePercent size={12} /> {pct}% OFF
    </span>
  );
}

// Price + purani price (cut) + save
export function PriceTag({
  p,
  qty = 1,
  big = "text-xl",
  light = false,
  className = "",
}) {
  const { fmt } = useGeo();
  const on = Number(p.sale_percent) > 0 && p.original_price > p.price;
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span
        className={`font-extrabold ${big} ${on ? (light ? "text-[#7fbaf7]" : "text-gold-500") : light ? "text-white" : "text-royal"}`}
      >
        {fmt(p.price * qty)}
      </span>
      {on && (
        <span
          className={`text-sm font-semibold line-through ${light ? "text-white/50" : "text-neutral-400"}`}
        >
          {fmt(p.original_price * qty)}
        </span>
      )}
    </div>
  );
}

const CSS = `
@keyframes sbMarq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.sb-marq{animation:sbMarq 24s linear infinite}
@keyframes sbSpin{to{transform:rotate(360deg)}}
.sb-spin{animation:sbSpin 26s linear infinite}
@keyframes sbPop{0%{opacity:0;transform:scale(.55) rotate(-10deg)}60%{transform:scale(1.08) rotate(2deg)}100%{opacity:1;transform:none}}
.sb-pop{animation:sbPop .85s cubic-bezier(.2,.9,.2,1) both}
@keyframes sbRise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.sb-rise{animation:sbRise .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes sbPulse{0%{box-shadow:0 0 0 0 rgba(29,127,224,.55)}100%{box-shadow:0 0 0 14px rgba(29,127,224,0)}}
.sb-pulse{animation:sbPulse 2s ease-out infinite}
@keyframes sbSheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(360%) skewX(-18deg)}}
.sb-sheen{animation:sbSheen 3.6s ease-in-out infinite}
@keyframes sbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.sb-float{animation:sbFloat 5s ease-in-out infinite}
.sb-cq{container-type:inline-size}
.sb-main{display:grid;gap:1.75rem;padding:1.25rem;align-items:center}
@container (min-width:480px){.sb-main{padding:2rem}}
@container (min-width:720px){.sb-main{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:2.5rem;padding:2.5rem}}
@container (min-width:960px){.sb-main{gap:3rem;padding:3.5rem}}
.sb-h{font-size:clamp(2.25rem,7cqi,4.5rem);line-height:1.02}
.sb-where{font-size:clamp(1.25rem,4.2cqi,2.25rem)}
.sb-pct{font-size:26cqi;line-height:1}
.sb-pcts{font-size:17cqi}
.sb-flat{font-size:clamp(9px,3.4cqi,12px)}
.sb-off{font-size:clamp(10px,4.4cqi,14px)}
@media (prefers-reduced-motion:reduce){.sb-marq,.sb-spin,.sb-pop,.sb-rise,.sb-pulse,.sb-sheen,.sb-float{animation:none}}
`;

// variant: "full" (Home / admin preview) | "compact" (Shop)
// preview: admin page ke liye {percent, count, total, all}
export default function SaleBanner({
  variant = "full",
  preview = null,
  className = "",
}) {
  const live = useSale();
  const s = preview
    ? {
        active: preview.percent > 0,
        max: preview.percent,
        min: preview.percent,
        same: true,
        count: preview.count,
        total: preview.total,
        all: !!preview.all,
      }
    : live;
  if (!s.active) return null;
  const embedded = !!preview; // admin preview: container ke andar, page-section nahi

  const pct = s.max;
  const head = s.same ? `${pct}% OFF` : `UP TO ${pct}% OFF`;
  const where = s.all
    ? "on every product"
    : `on ${s.count} selected product${s.count === 1 ? "" : "s"}`;
  const ticker = Array.from({ length: 8 }, () => head);

  if (variant === "compact") {
    return (
      <div
        className={`grain group relative overflow-hidden rounded-3xl bg-royal p-5 text-white shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 sm:p-6 ${className}`}
      >
        <style>{CSS}</style>
        <span className="sb-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#1d7fe0]/40 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4 sm:gap-6">
          <span
            key={pct}
            className="sb-pop grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#4aa3f0] to-[#0a3a78] font-display text-3xl font-bold shadow-lg transition duration-500 group-hover:rotate-6 group-hover:scale-110"
          >
            {pct}%
          </span>
          <div className="min-w-0 flex-1 basis-52">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#7fbaf7]">
              <Flame size={13} /> Sale is live
            </div>
            <div className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">
              {head} <span className="text-white/70">{where}</span>
            </div>
            <p className="mt-0.5 text-xs text-white/60">
              Discount cart aur checkout me khud lag jata hai.
            </p>
          </div>
          <a
            href="#shop-grid"
            className="btn-champ !px-6 !py-3"
            onClick={(e) => {
              const el = document.getElementById("shop-grid");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Shop now <ArrowRight size={15} />
          </a>
        </div>
      </div>
    );
  }

  const card = (
    <div className="sb-cq">
      <div className="grain group relative overflow-hidden rounded-[1.75rem] bg-royal text-white shadow-2xl shadow-black/25 sm:rounded-[2.5rem]">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-glow rounded-full bg-[#1d7fe0]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 animate-glow rounded-full bg-[#0a3a78]/50 blur-3xl" />
        <span className="sb-sheen pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="sb-main relative">
          <div className="min-w-0">
            <span className="sb-rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7fbaf7] backdrop-blur sm:px-4 sm:text-[11px] sm:tracking-[0.22em]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4aa3f0]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4aa3f0]" />
              </span>
              Limited time sale
            </span>
            <h2
              key={pct}
              className="sb-rise mt-4 font-display font-bold sm:mt-5"
              style={{ animationDelay: "120ms" }}
            >
              <span className="sb-h gold-text block break-words">{head}</span>
              <span className="sb-where mt-1 block text-white/90">{where}</span>
            </h2>
            <p
              className="sb-rise mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-base"
              style={{ animationDelay: "240ms" }}
            >
              Sale abhi live hai. Product par original price cut hoti hai aur
              naya price dikhta hai, cart aur checkout me discount khud lag jata
              hai.
            </p>
            <div
              className="sb-rise mt-6 flex flex-wrap gap-3 sm:mt-8"
              style={{ animationDelay: "360ms" }}
            >
              {embedded ? (
                <span className="btn-champ !px-7 !py-3 sm:!px-8 sm:!py-3.5">
                  Shop the sale <ArrowRight size={16} />
                </span>
              ) : (
                <Link
                  to="/shop"
                  className="btn-champ !px-7 !py-3 sm:!px-8 sm:!py-3.5"
                >
                  Shop the sale <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <div
              className="sb-rise mt-6 grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-3 sm:mt-8"
              style={{ animationDelay: "480ms" }}
            >
              {[
                { i: Zap, t: "Instant", d: "Live on the website" },
                {
                  i: BadgePercent,
                  t: "Auto applied",
                  d: "At cart & checkout",
                },
                {
                  i: ShieldCheck,
                  t: "All payments",
                  d: "COD, Stripe, PayPal",
                },
              ].map(({ i: I, t, d }) => (
                <div
                  key={t}
                  className="group/c flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur transition duration-500 hover:-translate-y-1.5 hover:border-[#4aa3f0]/60 hover:bg-white/[0.12] sm:p-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#4aa3f0] to-[#0a3a78] transition duration-500 group-hover/c:rotate-12 group-hover/c:scale-110">
                    <I size={17} />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-sm font-bold">{t}</span>
                    <span className="block text-[11px] text-white/60">{d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Percent badge */}
          <div className="sb-cq relative mx-auto w-full max-w-[240px] sm:max-w-[320px]">
            <div className="absolute inset-0 animate-glow rounded-full bg-[#1d7fe0]/40 blur-3xl" />
            <div className="sb-float relative aspect-square">
              <svg
                viewBox="0 0 400 400"
                className="sb-spin absolute inset-0"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id={`sbRing-${preview ? "p" : "l"}`}
                    d="M200,200 m-172,0 a172,172 0 1,1 344,0 a172,172 0 1,1 -344,0"
                  />
                </defs>
                <circle
                  cx="200"
                  cy="200"
                  r="192"
                  fill="none"
                  stroke="#4aa3f0"
                  strokeOpacity=".55"
                  strokeWidth="1.5"
                />
                <text
                  fontFamily="Manrope, sans-serif"
                  fontSize="17"
                  fontWeight="800"
                  letterSpacing="6"
                  fill="#bfdcfa"
                >
                  <textPath href={`#sbRing-${preview ? "p" : "l"}`}>
                    SALE · {pct}% OFF · LIVE NOW · SALE · {pct}% OFF · LIVE NOW
                    ·
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-[13%] grid place-items-center rounded-full border border-white/20 bg-gradient-to-br from-[#1d7fe0] via-[#0a3a78] to-[#060607] text-center shadow-2xl shadow-black/50 transition duration-700 group-hover:scale-105">
                <div key={pct} className="sb-pop">
                  <div className="sb-flat font-bold uppercase tracking-[0.3em] text-white/80">
                    {s.same ? "Flat" : "Up to"}
                  </div>
                  <div className="sb-pct font-display font-bold">
                    {pct}
                    <span className="sb-pcts">%</span>
                  </div>
                  <div className="sb-off mt-1 font-extrabold tracking-[0.4em]">
                    OFF
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ticker */}
        <div className="relative overflow-hidden border-t border-white/10 bg-black/30 py-3">
          <div className="sb-marq flex w-max gap-10 whitespace-nowrap text-sm font-extrabold tracking-[0.3em] text-white/80">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                {t}
                <Flame size={14} className="text-[#4aa3f0]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded)
    return (
      <div className={className}>
        <style>{CSS}</style>
        {card}
      </div>
    );
  return (
    <section className={`container-x py-10 sm:py-14 ${className}`}>
      <style>{CSS}</style>
      <Reveal>{card}</Reveal>
    </section>
  );
}
