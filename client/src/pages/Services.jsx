import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Tilt from "../components/Tilt";
import Icon from "../components/Icon";
import useContent from "../useContent";

export default function Services() {
  const { SERVICES: list, STEPS, sweets } = useContent();
  return (
    <div>
      <PageHero
        eyebrow="Our services"
        title={sweets ? "Crafted for every" : "Pure water for every"}
        accent={sweets ? "occasion" : "need"}
        text={
          sweets
            ? "Gift boxes, wedding orders, corporate hampers and doorstep delivery, all made with the same care."
            : "Home and office refills, bulk orders and doorstep delivery, all handled with the same care."
        }
      />

      <section className="container-x py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 100}>
              <Tilt className="group h-full rounded-3xl border border-champ-200 bg-white p-8 transition-shadow duration-500 hover:border-champ-400 hover:shadow-2xl hover:shadow-champ-200/50">
                <span className="grid h-16 w-16 place-items-center rounded-2xl champ-bg text-royal shadow-lg shadow-champ-300/40 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <Icon name={s.icon} size={28} />
                </span>
                <h3 className="mt-6 font-display text-3xl font-bold text-royal">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {s.text}
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-champ-600 transition-all group-hover:gap-3"
                >
                  Enquire <ArrowRight size={15} />
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-royal py-20">
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 animate-glow rounded-full bg-champ-400/20 blur-3xl" />
        <div className="container-x relative">
          <Reveal className="text-center">
            <span className="eyebrow !text-champ-300">Simple process</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              How ordering works
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="group h-full rounded-3xl border border-champ-300/20 bg-white/[0.04] p-7 transition duration-500 hover:-translate-y-2 hover:border-champ-300/60">
                  <span className="gold-text font-display text-5xl font-bold">
                    {s.n}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-champ-100">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-champ-100/70">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 text-center">
        <Reveal>
          <h2 className="title-lg">
            {sweets ? "Planning something special?" : "Need a regular supply?"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-600">
            {sweets
              ? "Tell us about your event or bulk order and we will get back to you by email."
              : "Tell us how many bottles you need and how often, and we will get back to you by email."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-gold">
              Contact us <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn-line">
              Browse the shop
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
