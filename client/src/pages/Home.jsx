import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Quote } from "lucide-react";
import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import CountUp from "../components/CountUp";
import Tilt from "../components/Tilt";
import HeroLuxury from "../components/HeroLuxury";
import HighlightCards from "../components/HighlightCards";
import CategoryCards from "../components/CategoryCards";
import EventBanner from "../components/EventBanner";
import SaleBanner from "../components/SaleBanner";
import { BrandMark } from "../components/Logo";
import { VARIETIES, brandFor } from "../config";
import { FAQS } from "../content";
import useContent from "../useContent";
import { useGeo, useShop } from "../store";

const AQUA_WORDS = [
  "Purified water",
  "Sealed fresh",
  "Home & office",
  "Pay on delivery",
  "19 L bottles",
  "Quick delivery",
  "Quality checked",
];

const WORDS = [
  "Pure desi ghee",
  "Hand rolled",
  "Second-day delivery",
  "Real khoya",
  "Special event boxes",
  "Made fresh daily",
  "Gift ready",
  "20 signature varieties",
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="container-x pb-20">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <span className="eyebrow">Got questions</span>
          <h2 className="title-lg mt-3">Frequently asked questions</h2>
          <p className="mt-4 max-w-sm text-neutral-600">
            Everything about delivery, special event boxes and ordering,
            answered clearly.
          </p>
          <Link to="/contact" className="btn-gold mt-7">
            Still curious? Talk to us <ArrowRight size={16} />
          </Link>
        </Reveal>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div
                  className={`${on ? "faq-open border-champ-400 shadow-xl shadow-champ-200/50" : "border-champ-200 hover:border-champ-300"} group relative overflow-hidden rounded-2xl border bg-white transition duration-500`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-1 origin-top champ-bg transition duration-500 ${on ? "scale-y-100" : "scale-y-0 group-hover:scale-y-50"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(on ? -1 : i)}
                    aria-expanded={on}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className="num-badge text-4xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-display text-xl font-bold leading-snug text-royal sm:text-2xl">
                      {f.q}
                    </span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-champ-300 text-champ-600 transition duration-500 ${on ? "rotate-[135deg] bg-champ-400 text-royal" : "group-hover:rotate-90"}`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                  <div className="faq-body">
                    <div>
                      <p className="px-5 pb-5 pl-[4.6rem] pr-6 text-sm leading-relaxed text-neutral-600 sm:pl-[5.2rem]">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { country } = useGeo();
  const { products, loading, error } = useShop();
  const brand = brandFor(country.code);
  // Pehle bestsellers, agar 4 se kam hon to baqi products se bhar do (home par hamesha products dikhein)
  const bestsellers = products.filter((p) => p.featured);
  const featured = (
    bestsellers.length >= 4
      ? bestsellers
      : [...bestsellers, ...products.filter((p) => !p.featured)]
  ).slice(0, 8);
  const aqua = country.categories.includes("aqua");
  const {
    sweets,
    STATS,
    STEPS,
    TESTIMONIALS,
    WHY,
    SERVICES: services,
  } = useContent();

  return (
    <div>
      {/* ============ HERO ============ */}
      <HeroLuxury />

      {/* ============ HIGHLIGHTS (4 luxury cards) ============ */}
      <HighlightCards sweets={sweets} />

      {/* ============ MARQUEE ============ */}
      <div className="marquee-pause overflow-hidden border-y border-champ-200 bg-champ-100/40 py-4">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[
            ...(sweets ? WORDS : AQUA_WORDS),
            ...(sweets ? WORDS : AQUA_WORDS),
            ...(sweets ? WORDS : AQUA_WORDS),
            ...(sweets ? WORDS : AQUA_WORDS),
          ].map((w, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-display text-2xl font-semibold text-royal"
            >
              {w}
              <span className="text-champ-500">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ SALE BANNER (admin sale lagate hi live) ============ */}
      <SaleBanner variant="full" />

      {/* ============ CATEGORIES (Evelyn One + Mithai cards) ============ */}
      <CategoryCards sweets={sweets} aqua={aqua} />

      {/* ============ FEATURED ============ */}
      <section className="container-x pb-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Bestsellers</span>
            <h2 className="title-lg mt-3">Customer favourites</h2>
          </div>
          <Link
            to="/shop"
            className="link-draw hidden pb-1 text-sm font-semibold text-royal sm:block"
          >
            View all
          </Link>
        </Reveal>
        {error && (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-3xl bg-champ-100/50"
                />
              ))
            : featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 90}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
        </div>
        {!loading && !error && featured.length === 0 && (
          <p className="mt-6 text-sm text-neutral-500">
            No products found yet. Add products from the admin panel (or run
            supabase/swarn-complete.sql in Supabase).
          </p>
        )}
        {!loading && featured.length > 0 && (
          <Reveal className="mt-10 text-center">
            <Link to="/shop" className="btn-gold !px-8 !py-3.5">
              View all products <ArrowRight size={16} />
            </Link>
          </Reveal>
        )}
      </section>

      {/* ============ VARIETIES ============ */}
      {sweets && (
        <section className="container-x pb-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Our menu</span>
            <h2 className="title-lg mt-3">
              20 signature <span className="text-champ-600">varieties</span>
            </h2>
            <p className="mt-3 text-neutral-600">
              Tap any mithai to see it in the shop.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {VARIETIES.map((v, i) => (
              <Reveal key={v} delay={(i % 5) * 60}>
                <Link
                  to={`/shop?q=${encodeURIComponent(v)}`}
                  className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-champ-200 bg-white px-4 py-3.5 transition duration-500 hover:-translate-y-1.5 hover:border-champ-400 hover:bg-royal hover:shadow-xl hover:shadow-champ-300/50"
                >
                  <span className="num-badge text-3xl transition duration-500 group-hover:scale-110">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-display text-xl font-bold text-royal transition duration-500 group-hover:text-champ-100">
                    {v}
                  </span>
                  <ArrowRight
                    size={15}
                    className="-translate-x-2 text-champ-300 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ EVENTS / SPECIAL BOX ============ */}
      <EventBanner variant="full" className="" />

      {/* ============ ABOUT TEASER ============ */}
      <section
        id="story"
        className="bg-gradient-to-b from-champ-100/60 to-[#f6f6f7] py-20"
      >
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <Tilt className="group mx-auto aspect-square w-full max-w-md rounded-[2.5rem] border border-champ-300 bg-royal p-3 shadow-2xl shadow-royal/30">
              <div className="grain relative grid h-full w-full place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-royal-light via-royal to-royal-deep">
                <div className="absolute inset-6 rounded-[1.6rem] border border-champ-300/40" />
                <div className="text-center">
                  <div className="mx-auto w-fit">
                    <BrandMark size={160} />
                  </div>
                  <p className="mt-5 font-display text-4xl font-bold text-champ-200">
                    {sweets ? "Since the first batch" : "Pure, every bottle"}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-champ-400">
                    {sweets
                      ? "Handcrafted with patience"
                      : "Tested and sealed fresh"}
                  </p>
                </div>
              </div>
            </Tilt>
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">About {brand.name}</span>
            <h2 className="title-lg mt-3">
              {sweets ? (
                <>
                  Sweets the way{" "}
                  <span className="text-champ-600">your elders</span> made them
                </>
              ) : (
                <>
                  Pure water, <span className="text-champ-600">sealed</span>{" "}
                  fresh
                </>
              )}
            </h2>
            <p className="mt-5 leading-relaxed text-neutral-600">
              {sweets
                ? "Mithai House is the standard we cook to. Every piece is hand rolled in small batches with pure desi ghee, real khoya, whole nuts and saffron, then packed like a gift because that is what it is."
                : "Evelyn One is the name families trust for clean drinking water. Every bottle is purified in several stages, tested and sealed before it ever leaves us."}
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              {sweets
                ? "No shortcuts, no artificial flavour and no stale boxes sitting in a warehouse. Cooked fresh, sealed with care and delivered to your door."
                : "No shortcuts and no old stock sitting in a warehouse. Clean bottles, sealed with care and delivered to your door."}
            </p>
            <Link to="/about" className="btn-gold mt-8">
              Read our story <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="container-x py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Our services</span>
          <h2 className="title-lg mt-3">
            {sweets ? "More than a sweet shop" : "More than bottled water"}
          </h2>
          <p className="mt-3 text-neutral-600">
            {sweets
              ? "From a single gift box to a full wedding order, we handle it with the same care."
              : "From a single bottle to a weekly office supply, we handle it with the same care."}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <Tilt className="group h-full rounded-3xl border border-champ-200 bg-white p-7 transition-shadow duration-500 hover:border-champ-400 hover:shadow-2xl hover:shadow-champ-200/50">
                <span className="grid h-14 w-14 place-items-center rounded-2xl champ-bg text-royal shadow-lg shadow-champ-300/40 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <Icon name={s.icon} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-royal">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {s.text}
                </p>
              </Tilt>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/services" className="btn-line">
            Explore all services <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="grain relative overflow-hidden bg-royal py-24">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 animate-glow rounded-full bg-champ-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 animate-glow rounded-full bg-gold-500/25 blur-3xl" />
        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow !text-champ-300">Why choose us</span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Six reasons families <span className="gold-text">come back</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <div className="group h-full rounded-3xl border border-champ-300/20 bg-white/[0.04] p-7 backdrop-blur transition duration-500 hover:-translate-y-2 hover:border-champ-300/60 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-black/30">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-champ-300/40 text-champ-300 transition duration-500 group-hover:rotate-12 group-hover:bg-champ-400 group-hover:text-royal">
                    <Icon name={w.icon} size={22} />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-champ-100">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-champ-100/70">
                    {w.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="gold-text font-display text-5xl font-bold">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-champ-100/60">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/why-us" className="btn-ghost-light">
              See the full story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="container-x py-20">
        <Reveal className="text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="title-lg mt-3">
            {sweets
              ? "From our kitchen to your door"
              : "From our plant to your door"}
          </h2>
        </Reveal>
        <div className="relative mt-12 grid gap-6 md:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-champ-400 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="group relative text-center">
                <span className="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-full border border-champ-300 bg-white font-display text-2xl font-bold text-champ-600 shadow-lg transition duration-500 group-hover:scale-110 group-hover:bg-champ-400 group-hover:text-royal">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold text-royal">
                  {s.title}
                </h3>
                <p className="mx-auto mt-1 max-w-[220px] text-sm text-neutral-600">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      {sweets && <Faq />}

      {/* ============ TESTIMONIALS ============ */}
      <section className="overflow-hidden bg-champ-100/40 py-20">
        <Reveal className="container-x text-center">
          <span className="eyebrow">Kind words</span>
          <h2 className="title-lg mt-3">What our customers say</h2>
        </Reveal>
        <div className="marquee-pause mt-12">
          <div className="marquee flex w-max gap-6 [animation-duration:60s]">
            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <figure
                key={i}
                className="w-[340px] shrink-0 rounded-3xl border border-champ-200 bg-white p-7 transition duration-500 hover:-translate-y-1 hover:border-champ-400 hover:shadow-xl hover:shadow-champ-200/50"
              >
                <Quote className="text-champ-400" size={26} />
                <blockquote className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {t.text}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full champ-bg font-bold text-royal">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-royal">
                      {t.name}
                    </span>
                    <span className="text-xs text-neutral-500">{t.place}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="container-x py-20">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2.5rem] bg-royal px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 animate-glow rounded-full bg-champ-400/30 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
                Ready for something{" "}
                <span className="gold-text">
                  {sweets ? "truly sweet?" : "truly pure?"}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-champ-100/75">
                No account needed. Choose your favourites, place the order and
                pay when it arrives.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/shop" className="btn-champ !px-8 !py-3.5">
                  Order now <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn-ghost-light !px-8 !py-3.5">
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
