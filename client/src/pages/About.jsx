import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import Tilt from "../components/Tilt";
import Icon from "../components/Icon";
import { BrandMark } from "../components/Logo";
import useContent from "../useContent";

const AQUA_VALUES = [
  {
    icon: "Droplets",
    t: "Purity first",
    d: "Multi-stage purification and regular testing. We never cut corners on what goes in the bottle.",
  },
  {
    icon: "ShieldCheck",
    t: "Sealed fresh",
    d: "Every bottle is checked and sealed so it reaches you exactly as it left us.",
  },
  {
    icon: "Truck",
    t: "Always on time",
    d: "Reliable delivery for homes and offices, because running out of water is not an option.",
  },
];

const VALUES = [
  {
    icon: "Gem",
    t: "Purity first",
    d: "Desi ghee, real khoya, whole nuts and saffron. We never replace them with cheaper options.",
  },
  {
    icon: "HandHeart",
    t: "Made by hand",
    d: "Small batches shaped by experienced hands, because machines cannot match the feel.",
  },
  {
    icon: "Flame",
    t: "Always fresh",
    d: "We cook to order so every box reaches you at its best, not after weeks on a shelf.",
  },
];

export default function About() {
  const { STATS, STEPS, sweets } = useContent();
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={sweets ? "A taste of" : "Pure water,"}
        accent={sweets ? "tradition" : "every day"}
        text={
          sweets
            ? "Mithai House is the standard we hold every sweet to, from the first stir of the pan to the last ribbon on the box."
            : "Evelyn One is the standard we hold our water to, from the first filter to the final seal on the bottle."
        }
      />

      <section className="container-x grid items-center gap-14 py-20 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">Our story</span>
          <h2 className="title-lg mt-3">
            {sweets
              ? "Born in the kitchen, perfected with patience"
              : "Purified with care, delivered with trust"}
          </h2>
          <p className="mt-5 leading-relaxed text-neutral-600">
            {sweets
              ? "Mithai House started with a simple belief: mithai should taste the way it did when your grandmother made it for Eid. Slow cooked, ghee rich and never rushed."
              : "Evelyn One started with a simple belief: clean drinking water should be easy to get, reliable and fairly priced for every home and office."}
          </p>
          <p className="mt-4 leading-relaxed text-neutral-600">
            {sweets
              ? "We cook in small batches, roll every piece by hand and pack each box ourselves. Whether it is a gift for one person or a wedding order for hundreds, the recipe and the care stay exactly the same."
              : "We purify in several stages, test every batch and seal every bottle ourselves. Whether it is one bottle for your home or a weekly supply for an office, the quality and the care stay exactly the same."}
          </p>
          <Link to="/shop" className="btn-gold mt-8">
            {sweets ? "Taste the collection" : "Shop water"}{" "}
            <ArrowRight size={16} />
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <Tilt className="group mx-auto aspect-[4/5] w-full max-w-sm rounded-[2.5rem] border border-champ-300 bg-royal p-3 shadow-2xl shadow-royal/30">
            <div className="grain relative grid h-full w-full place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-royal-light via-royal to-royal-deep">
              <div className="absolute inset-5 rounded-[1.6rem] border border-champ-300/40" />
              <div className="text-center">
                <div className="mx-auto w-fit">
                  <BrandMark size={150} />
                </div>
                <p className="mt-5 font-display text-4xl font-bold text-champ-200">
                  {sweets ? "Mithai House" : "Evelyn One"}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champ-400">
                  {sweets ? "Mithai and Sweets" : "Pure Drinking Water"}
                </p>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </section>

      <section className="grain relative overflow-hidden bg-royal py-20">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 animate-glow rounded-full bg-champ-400/20 blur-3xl" />
        <div className="container-x relative">
          <Reveal className="text-center">
            <span className="eyebrow !text-champ-300">What we stand for</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              Our values
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(sweets ? VALUES : AQUA_VALUES).map((v, i) => (
              <Reveal key={v.t} delay={i * 110}>
                <div className="group h-full rounded-3xl border border-champ-300/20 bg-white/[0.04] p-8 transition duration-500 hover:-translate-y-2 hover:border-champ-300/60 hover:bg-white/[0.08]">
                  <span className="grid h-14 w-14 place-items-center rounded-full champ-bg text-royal transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Icon name={v.icon} />
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-bold text-champ-100">
                    {v.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-champ-100/70">
                    {v.d}
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
        </div>
      </section>

      <section className="container-x py-20">
        <Reveal className="text-center">
          <span className="eyebrow">
            {sweets ? "Our craft" : "Our process"}
          </span>
          <h2 className="title-lg mt-3">
            {sweets ? "How every box is made" : "How every bottle is made"}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="card-lux group h-full p-7 text-center">
                <span className="font-display text-5xl font-bold text-champ-400 transition duration-500 group-hover:scale-110 group-hover:text-champ-500">
                  {s.n}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-royal">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
