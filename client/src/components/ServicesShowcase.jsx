import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import Icon from "./Icon";

const CSS = `
.sv-line{background:linear-gradient(90deg,#4aa3f0,#eaf4ff 50%,#4aa3f0);background-size:200% 100%;animation:svLine 4s linear infinite}
@keyframes svLine{to{background-position:-200% 0}}
@keyframes svSpin{to{transform:rotate(360deg)}}
.sv-ring{animation:svSpin 26s linear infinite}
@keyframes svFloat{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-14px) rotate(-4deg)}}
.sv-ghost{animation:svFloat 8s ease-in-out infinite}
@keyframes svIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.sv-in{animation:svIn .6s cubic-bezier(.2,.7,.2,1) both}
.sv-in.d1{animation-delay:.08s}
.sv-in.d2{animation-delay:.16s}
@keyframes svPop{from{opacity:0;transform:scale(.7) rotate(-14deg)}to{opacity:1;transform:none}}
.sv-pop{animation:svPop .7s cubic-bezier(.2,.8,.2,1) both}
.sv-row{transition:transform .5s cubic-bezier(.2,.7,.2,1),background-color .5s ease,border-color .5s ease}
.sv-row:hover{transform:translateX(6px)}
@media (max-width:1023px){.sv-row:hover{transform:none}}
@keyframes svSheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(520%) skewX(-18deg)}}
.sv-row:hover .sv-sheen{animation:svSheen 1.1s ease}
.sv-cta .sv-arrow{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.sv-cta:hover .sv-arrow{transform:translateX(5px)}
.sv-more{transition:grid-template-rows .55s cubic-bezier(.2,.7,.2,1)}
@media (prefers-reduced-motion:reduce){
  .sv-line,.sv-ring,.sv-ghost,.sv-in,.sv-pop{animation:none}
  .sv-row:hover .sv-sheen{animation:none}
}
`;

export default function ServicesShowcase({ services = [], sweets = true }) {
  const list = services.slice(0, 6);
  const [active, setActive] = useState(0);
  const cur = list[active] || list[0];
  if (!cur) return null;

  return (
    <section className="grain relative overflow-hidden bg-royal py-16 sm:py-24">
      <style>{CSS}</style>
      <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 animate-glow rounded-full bg-champ-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 animate-glow rounded-full bg-gold-500/25 blur-3xl" />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow !text-champ-300">Our services</span>
          <h2 className="mt-3 font-display text-[2.4rem] font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {sweets ? "More than a sweet shop" : "More than bottled water"}
          </h2>
          <span className="sv-line mx-auto mt-5 block h-[2px] w-24 rounded-full" />
          <p className="mt-5 text-[15px] leading-relaxed text-champ-100/75 sm:text-base">
            {sweets
              ? "From a single gift box to a full wedding order, we handle it with the same care."
              : "From a single bottle to a weekly office supply, we handle it with the same care."}
          </p>
        </Reveal>

        <div className="mt-10 grid items-start gap-6 sm:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          {/* ============ list ============ */}
          <Reveal>
            <div
              className="space-y-2.5 sm:space-y-3"
              role="tablist"
              aria-label="Our services"
            >
              {list.map((s, i) => {
                const on = i === active;
                return (
                  <div key={s.title}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={`sv-row group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border px-4 py-3.5 text-left sm:gap-5 sm:px-5 sm:py-4 ${on ? "border-champ-300/60 bg-white/[0.1] shadow-[0_24px_50px_-28px_rgba(0,0,0,.8)]" : "border-white/10 bg-white/[0.03] hover:border-champ-300/30 hover:bg-white/[0.06]"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 w-1 origin-top champ-bg transition duration-500 ${on ? "scale-y-100" : "scale-y-0"}`}
                      />
                      <span
                        aria-hidden="true"
                        className="sv-sheen pointer-events-none absolute inset-y-0 left-0 w-1/5 -translate-x-[140%] bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      />
                      <span
                        className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full border transition duration-500 sm:h-14 sm:w-14 ${on ? "border-transparent champ-bg text-royal" : "border-champ-300/40 text-champ-300 group-hover:rotate-6"}`}
                      >
                        <Icon name={s.icon} size={22} />
                      </span>
                      <span
                        className={`relative min-w-0 flex-1 font-display text-[1.45rem] font-bold leading-tight transition-colors duration-500 sm:text-3xl ${on ? "text-white" : "text-champ-100/75 group-hover:text-white"}`}
                      >
                        {s.title}
                      </span>
                      <span
                        className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border transition duration-500 ${on ? "rotate-0 border-champ-300 bg-champ-400 text-royal" : "-rotate-45 border-champ-300/30 text-champ-300/70 group-hover:rotate-0"}`}
                      >
                        <ArrowRight size={16} />
                      </span>
                    </button>

                    {/* mobile / tablet: details open under the row */}
                    <div
                      className={`sv-more grid lg:hidden ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-2 pb-1 pt-3">
                          <p className="text-sm leading-relaxed text-champ-100/80">
                            {s.text}
                          </p>
                          <Link
                            to="/contact"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-champ-300"
                          >
                            Plan this with us <ArrowUpRight size={15} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* ============ stage (desktop) ============ */}
          <Reveal delay={120} className="hidden lg:block">
            <div className="relative min-h-[27rem] overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-white via-champ-100 to-champ-200/70 p-10 shadow-[0_50px_100px_-40px_rgba(0,0,0,.8)] xl:p-12">
              <div
                aria-hidden="true"
                className="sv-ghost pointer-events-none absolute -bottom-10 -right-8 text-champ-300/40 [&_svg]:h-[19rem] [&_svg]:w-[19rem] [&_svg]:stroke-[0.8]"
              >
                <div key={`g-${active}`} className="sv-pop">
                  <Icon name={cur.icon} size={300} />
                </div>
              </div>
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-champ-300/30 blur-3xl" />

              <div
                key={active}
                className="relative flex min-h-[23rem] flex-col"
              >
                <div className="sv-pop relative h-24 w-24">
                  <svg
                    viewBox="0 0 96 96"
                    aria-hidden="true"
                    className="sv-ring absolute inset-0 h-full w-full"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="46"
                      fill="none"
                      stroke="#1d7fe0"
                      strokeOpacity=".6"
                      strokeWidth="1.4"
                      strokeDasharray="2 6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-3 grid place-items-center rounded-full bg-royal text-champ-300 shadow-xl shadow-champ-400/40">
                    <Icon name={cur.icon} size={30} />
                  </span>
                </div>

                <h3 className="sv-in d1 mt-8 font-display text-5xl font-bold leading-[1.05] text-royal xl:text-6xl">
                  {cur.title}
                </h3>
                <span className="sv-line sv-in d1 mt-5 block h-[2px] w-20 rounded-full" />
                <p className="sv-in d2 mt-5 max-w-md text-base leading-relaxed text-neutral-600">
                  {cur.text}
                </p>

                <div className="sv-in d2 mt-auto flex flex-wrap items-center gap-4 pt-8">
                  <Link to="/contact" className="sv-cta btn-gold !px-7 !py-3.5">
                    Plan this with us{" "}
                    <ArrowRight size={16} className="sv-arrow" />
                  </Link>
                </div>
              </div>

              {/* position dots */}
              <div className="absolute bottom-8 right-10 flex items-center gap-1.5">
                {list.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    aria-label={s.title}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-royal" : "w-2 bg-royal/25 hover:bg-royal/50"}`}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-10 text-center sm:mt-12">
          <Link to="/services" className="sv-cta btn-champ !px-8 !py-3.5">
            Explore all services <ArrowRight size={16} className="sv-arrow" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
