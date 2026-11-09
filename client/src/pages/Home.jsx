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
import AboutTeaser from "../components/AboutTeaser";
import WhyChoose from "../components/WhyChoose";
import ServicesShowcase from "../components/ServicesShowcase";
import MenuShowcase from "../components/MenuShowcase";
import SaleBanner from "../components/SaleBanner";
import { BrandMark } from "../components/Logo";
import { brandFor } from "../config";
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
      {sweets && <MenuShowcase />}

      {/* ============ EVENTS / SPECIAL BOX ============ */}
      <EventBanner variant="full" className="" />

      {/* ============ ABOUT TEASER ============ */}
      <AboutTeaser sweets={sweets} />

      {/* ============ SERVICES ============ */}
      <ServicesShowcase services={services} sweets={sweets} />

      {/* ============ WHY CHOOSE US ============ */}
      <WhyChoose items={WHY} stats={STATS} sweets={sweets} />

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
      {TESTIMONIALS.length > 0 && (
        <section className="overflow-hidden bg-champ-100/40 py-20">
          <Reveal className="container-x text-center">
            <span className="eyebrow">Kind words</span>
            <h2 className="title-lg mt-3">What our customers say</h2>
          </Reveal>
          <div className="marquee-pause mt-12">
            <div className="marquee flex w-max gap-6 [animation-duration:60s]">
              {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map(
                (t, i) => (
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
                        <span className="text-xs text-neutral-500">
                          {t.place}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                ),
              )}
            </div>
          </div>
        </section>
      )}

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
