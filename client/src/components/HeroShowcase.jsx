import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import FitImage from "./FitImage";
import { imagesOf, videoOf } from "../lib/img";
import { useGeo } from "../store";

// Hero ka slider: products ki HD images ek ke baad ek (poori image, stretch nahi).
// Kisi product ki image na ho to `fallback` dikhta hai.
export default function HeroShowcase({ products, fallback }) {
  const { fmt } = useGeo();
  const slides = useMemo(
    () => products.filter((p) => imagesOf(p).length).slice(0, 8),
    [products],
  );
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 4500);
    return () => clearInterval(t);
  }, [n, paused]);
  useEffect(() => {
    if (i >= n) setI(0);
  }, [n, i]);

  if (!n) return fallback;
  const go = (d) => setI((v) => (v + d + n) % n);
  const cur = slides[Math.min(i, n - 1)];
  const pad = (v) => String(v).padStart(2, "0");

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group/hero relative mx-auto w-full max-w-[520px]"
    >
      <div className="absolute -inset-4 animate-glow rounded-[3rem] bg-champ-400/25 blur-3xl" />
      <div className="glow-border relative aspect-[4/5] w-full overflow-hidden rounded-[2.2rem] border border-white/15 bg-[#111114] shadow-2xl shadow-black/50 sm:aspect-square lg:aspect-[4/5]">
        {slides.map((p, k) => (
          <div
            key={p.id}
            aria-hidden={k !== i}
            className={`group absolute inset-0 transition-all duration-[900ms] ease-out ${k === i ? "scale-100 opacity-100" : "pointer-events-none scale-110 opacity-0"}`}
          >
            <FitImage
              src={imagesOf(p)[0]}
              alt={p.name}
              w={1400}
              eager={k === 0}
              zoom={false}
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#060607]/90 via-[#060607]/40 to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/hero:animate-[sheen_1.4s_ease]" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border border-white/25 bg-[#060607]/60 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-white backdrop-blur-md">
            {pad(Math.min(i, n - 1) + 1)} / {pad(n)}
          </span>
          {videoOf(cur) && (
            <span className="inline-flex items-center gap-1 rounded-full champ-bg px-3 py-1 text-[11px] font-bold text-royal">
              <Play size={11} fill="currentColor" /> Video
            </span>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div key={cur.id} className="min-w-0 animate-fadeUp">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-champ-300">
              {cur.unit || "Mithai"}
            </div>
            <div className="truncate font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {cur.name}
            </div>
            <div className="text-lg font-extrabold text-champ-100">
              {fmt(cur.price)}
            </div>
          </div>
          <Link
            to={`/product/${cur.id}`}
            aria-label={`View ${cur.name}`}
            className="group/go grid h-12 w-12 shrink-0 place-items-center rounded-full champ-bg text-royal shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-110"
          >
            <ArrowUpRight
              size={20}
              className="transition duration-300 group-hover/go:rotate-45"
            />
          </Link>
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute right-16 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-[#060607]/60 text-white backdrop-blur-md transition hover:scale-110 hover:bg-gold-600"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-[#060607]/60 text-white backdrop-blur-md transition hover:scale-110 hover:bg-gold-600"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((p, k) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show ${p.name}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? "w-10 champ-bg" : "w-4 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
