import { Link } from "react-router-dom";
import { ArrowRight, Check, Quote, X } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Icon from "../components/Icon";
import CountUp from "../components/CountUp";
import useContent from "../useContent";

const AQUA_ROWS = [
  ["Purified in several stages", "Untreated or unknown source"],
  ["Tested and sealed fresh", "Open or reused bottles"],
  ["Home and office delivery", "Pick up yourself"],
  ["Order without an account", "Forced sign up before checkout"],
  ["Pay on delivery", "Advance payment only"],
  ["Clear prices in rupees", "Hidden delivery charges"],
];

const ROWS = [
  ["Cooked fresh for your order", "Often made in bulk, days earlier"],
  ["Pure desi ghee and real khoya", "Vegetable oil and fillers"],
  ["Hand rolled in small batches", "Machine made in large runs"],
  ["Order without an account", "Forced sign up before checkout"],
  ["Pay on delivery", "Advance payment only"],
  ["Gift ready luxury packaging", "Plain boxes"],
];

export default function WhyUs() {
  const { STATS, TESTIMONIALS, WHY, sweets } = useContent();
  const brand = sweets ? "Best Mithai" : "Evelyn One";
  return (
    <div>
      <PageHero
        eyebrow="Why choose us"
        title={`The ${brand}`}
        accent="difference"
        text="Six promises we keep on every single order, big or small."
      />

      <section className="container-x py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 100}>
              <div className="card-lux group h-full p-8">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-champ-300 bg-champ-100/50 text-champ-600 transition duration-500 group-hover:rotate-12 group-hover:bg-champ-400 group-hover:text-royal">
                  <Icon name={w.icon} />
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold text-royal">
                  {w.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {w.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-royal py-20">
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 animate-glow rounded-full bg-champ-400/20 blur-3xl" />
        <div className="container-x relative">
          <Reveal className="text-center">
            <span className="eyebrow !text-champ-300">Compare</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              {brand} vs the usual
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-champ-300/30 bg-white/[0.04] backdrop-blur">
              <div className="grid grid-cols-2 bg-champ-400/15 text-sm font-bold uppercase tracking-wider">
                <div className="p-4 text-champ-300">{brand}</div>
                <div className="p-4 text-champ-100/60">Usual shops</div>
              </div>
              {(sweets ? ROWS : AQUA_ROWS).map(([a, b]) => (
                <div
                  key={a}
                  className="group grid grid-cols-2 border-t border-white/10 text-sm transition hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3 p-4 text-champ-100">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full champ-bg text-royal">
                      <Check size={13} />
                    </span>
                    {a}
                  </div>
                  <div className="flex items-center gap-3 p-4 text-champ-100/50">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10">
                      <X size={13} />
                    </span>
                    {b}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
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
        </div>
      </section>

      <section className="container-x py-20">
        {TESTIMONIALS.length > 0 && (
          <>
          <Reveal className="text-center">
            <span className="eyebrow">Kind words</span>
            <h2 className="title-lg mt-3">Loved by our customers</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={(i % 2) * 100}>
                <figure className="card-lux h-full p-8">
                  <Quote className="text-champ-400" size={28} />
                  <blockquote className="mt-3 leading-relaxed text-neutral-600">
                    {t.text}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full champ-bg font-bold text-royal">
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
              </Reveal>
            ))}
          </div>
          </>
        )}
        <Reveal className="mt-12 text-center">
          <Link to="/shop" className="btn-gold !px-8 !py-3.5">
            Start your order <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
