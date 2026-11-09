import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import Icon from "./Icon";
import CountUp from "./CountUp";
import { BrandMark } from "./Logo";

const CSS = `
.wy-spin{animation:wySpin 40s linear infinite}
.wy-spin-rev{animation:wySpin 64s linear infinite reverse}
.wy-orbit{animation:wySpin 22s linear infinite}
@keyframes wySpin{to{transform:rotate(360deg)}}
@keyframes wyPulse{0%{transform:scale(.92);opacity:.6}100%{transform:scale(1.28);opacity:0}}
.wy-pulse{animation:wyPulse 3.8s ease-out infinite}
.wy-pulse.d2{animation-delay:1.9s}
.wy-line{background:linear-gradient(90deg,#4aa3f0,#0a3a78 50%,#4aa3f0);background-size:200% 100%;animation:wyLine 4s linear infinite}
@keyframes wyLine{to{background-position:-200% 0}}

.wy-card{transition:transform .6s cubic-bezier(.2,.7,.2,1),border-color .6s ease,box-shadow .6s ease}
.wy-card:hover{transform:translateY(-6px);border-color:#0b0b0d;box-shadow:0 34px 60px -30px rgba(29,127,224,.6)}
@media (min-width:1024px){
  .wy-l:hover{transform:translateX(10px)}
  .wy-r:hover{transform:translateX(-10px)}
  .wy-l .wy-fill{transform-origin:right}
}
.wy-fill{transform:scaleX(0);transform-origin:left;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
.wy-card:hover .wy-fill{transform:scaleX(1)}
.wy-t,.wy-d{transition:color .5s ease}
.wy-card:hover .wy-t{color:#fff}
.wy-card:hover .wy-d{color:rgba(234,244,255,.8)}
.wy-ico{transition:transform .6s cubic-bezier(.2,.7,.2,1),background .5s ease,color .5s ease}
.wy-card:hover .wy-ico{transform:rotate(-10deg) scale(1.1);background:linear-gradient(120deg,#3d9bea,#bfdcfa);color:#0b0b0d}
.wy-orb{transition:transform .7s cubic-bezier(.2,.7,.2,1),border-color .5s ease}
.wy-card:hover .wy-orb{transform:scale(1.8);border-color:rgba(122,185,243,.6)}
.wy-base{transform:scaleX(0);transform-origin:left;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.wy-card:hover .wy-base{transform:scaleX(1)}
@keyframes wySheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(520%) skewX(-18deg)}}
.wy-card:hover .wy-sheen{animation:wySheen 1.2s ease}

.wy-seal{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.wy-seal:hover{transform:scale(1.04)}
.wy-stat{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.wy-stat:hover{transform:translateY(-4px)}
.wy-bar{transform:scaleX(.25);transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.wy-stat:hover .wy-bar{transform:scaleX(1)}
.wy-cta .wy-arrow{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.wy-cta:hover .wy-arrow{transform:translateX(5px)}
@media (prefers-reduced-motion:reduce){
  .wy-spin,.wy-spin-rev,.wy-orbit,.wy-pulse,.wy-line{animation:none}
  .wy-card:hover .wy-sheen{animation:none}
}
`;

// lg par: left column (0,2,4) | seal | right column (1,3,5)
const POS = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-3 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-3 lg:row-start-3",
];

const RING =
  "SIX REASONS FAMILIES COME BACK\u00A0\u00A0✦\u00A0\u00A0SIX REASONS FAMILIES COME BACK\u00A0\u00A0✦\u00A0\u00A0";

export default function WhyChoose({ items = [], stats = [], sweets = true }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-champ-100/50 to-white py-16 sm:py-24">
      <style>{CSS}</style>
      <div className="hairline absolute inset-x-0 top-0" />
      <div className="pointer-events-none absolute -left-32 top-20 h-[26rem] w-[26rem] rounded-full bg-champ-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-[26rem] w-[26rem] rounded-full bg-champ-200/40 blur-3xl" />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Why choose us</span>
          <h2 className="title-lg mt-3 sm:!text-6xl">
            Six reasons families{" "}
            <span className="text-champ-600">come back</span>
          </h2>
          <span className="wy-line mx-auto mt-5 block h-[2px] w-24 rounded-full" />
        </Reveal>

        <div className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[1fr_21rem_1fr] lg:gap-x-8 lg:gap-y-5">
          {/* ============ centre seal ============ */}
          <Reveal className="sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center">
            <div className="wy-seal relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[20rem] lg:max-w-none">
              <div className="absolute inset-[-8%] rounded-full bg-champ-300/30 blur-3xl" />
              <div className="grain absolute inset-0 overflow-hidden rounded-full border border-champ-300/50 bg-royal shadow-[0_40px_90px_-30px_rgba(10,58,120,.75)]">
                <span className="wy-pulse absolute inset-[26%] rounded-full border border-champ-300/40" />
                <span className="wy-pulse d2 absolute inset-[26%] rounded-full border border-champ-300/30" />
              </div>

              <svg
                viewBox="0 0 400 400"
                aria-hidden="true"
                className="wy-spin absolute inset-[4%] h-[92%] w-[92%]"
              >
                <defs>
                  <path
                    id="wyRing"
                    d="M200,200 m-166,0 a166,166 0 1,1 332,0 a166,166 0 1,1 -332,0"
                  />
                </defs>
                <text
                  fill="#bfdcfa"
                  fontSize="15"
                  fontWeight="700"
                  letterSpacing="4"
                  style={{ fontFamily: "Manrope, system-ui, sans-serif" }}
                >
                  <textPath href="#wyRing" textLength="1030">
                    {RING}
                  </textPath>
                </text>
              </svg>

              <svg
                viewBox="0 0 400 400"
                aria-hidden="true"
                className="wy-spin-rev absolute inset-[21%] h-[58%] w-[58%]"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill="none"
                  stroke="#4aa3f0"
                  strokeOpacity=".6"
                  strokeWidth="2"
                  strokeDasharray="2 12"
                  strokeLinecap="round"
                />
              </svg>

              {/* orbiting dots */}
              <div className="wy-orbit absolute inset-[13%]" aria-hidden="true">
                <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-champ-300 shadow-[0_0_14px_3px_rgba(122,185,243,.8)]" />
                <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/70" />
              </div>

              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center text-center">
                  <BrandMark size={sweets ? 66 : 84} />
                  <span className="mt-3 block h-px w-16 bg-gradient-to-r from-transparent via-champ-300 to-transparent" />
                  <p className="mt-3 font-display text-xl font-bold leading-tight text-champ-100 sm:text-2xl">
                    {sweets ? "Made fresh daily" : "Sealed fresh daily"}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ============ 6 reasons ============ */}
          {items.map((w, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal
                key={w.title}
                delay={i * 70}
                className={`h-full ${POS[i] || ""}`}
              >
                <article
                  className={`wy-card ${left ? "wy-l" : "wy-r"} group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-champ-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(11,11,13,.4)] sm:rounded-[1.75rem] sm:p-6 ${left ? "lg:items-end lg:text-right" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className="wy-fill absolute inset-0 bg-royal"
                  />
                  <span
                    aria-hidden="true"
                    className="wy-orb pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border border-champ-300/50"
                  />
                  <span
                    aria-hidden="true"
                    className="wy-sheen pointer-events-none absolute inset-y-0 left-0 w-1/5 -translate-x-[140%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />

                  <span
                    className={`wy-ico relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-royal text-champ-300 shadow-lg shadow-champ-300/40`}
                  >
                    <Icon name={w.icon} size={24} />
                  </span>
                  <h3 className="wy-t relative mt-4 font-display text-2xl font-bold leading-tight text-royal">
                    {w.title}
                  </h3>
                  <p className="wy-d relative mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">
                    {w.text}
                  </p>
                  <span
                    aria-hidden="true"
                    className="wy-base absolute inset-x-0 bottom-0 h-[3px] champ-bg"
                  />
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* ============ stats band ============ */}
        <Reveal className="mt-12 sm:mt-16">
          <div className="grain relative grid grid-cols-2 overflow-hidden rounded-[1.5rem] bg-royal shadow-[0_30px_70px_-34px_rgba(10,58,120,.7)] sm:rounded-[2rem] md:grid-cols-4">
            {stats.map((s, k) => (
              <div
                key={s.label}
                className={`wy-stat relative px-3 py-7 text-center sm:px-4 sm:py-9 ${k % 2 === 1 ? "border-l border-white/10" : ""} ${k > 1 ? "border-t border-white/10 md:border-t-0" : ""} ${k > 0 ? "md:border-l md:border-white/10" : ""}`}
              >
                <div className="gold-text font-display text-4xl font-bold leading-none sm:text-5xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <span className="wy-bar mx-auto mt-3 block h-px w-12 bg-champ-300/70" />
                <div className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-champ-100/70 sm:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-9 text-center sm:mt-10">
          <Link to="/why-us" className="wy-cta btn-gold">
            See the full story <ArrowRight size={16} className="wy-arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
