import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Code2,
  Droplets,
  Gift,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import Logo from "./Logo";
import Reveal from "./Reveal";
import { CATEGORIES, SHOP_INFO, brandFor } from "../config";
import { useGeo } from "../store";

const digits = (s) => String(s || "").replace(/\D/g, "");
const tel = (n) => `tel:${String(n).replace(/[^+\d]/g, "")}`;

const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

// Floating decoration: Pakistan = paani ke bubbles, USA = chamakte sparkles (fixed positions)
const BUBBLES = [
  { l: 6, s: 10, d: 9, o: 0 },
  { l: 14, s: 16, d: 13, o: 3 },
  { l: 23, s: 8, d: 10, o: 6 },
  { l: 33, s: 20, d: 15, o: 1 },
  { l: 44, s: 9, d: 11, o: 8 },
  { l: 55, s: 14, d: 14, o: 4 },
  { l: 64, s: 7, d: 9, o: 2 },
  { l: 73, s: 18, d: 16, o: 7 },
  { l: 82, s: 10, d: 12, o: 5 },
  { l: 91, s: 13, d: 10, o: 9 },
];
const SPARKS = [
  { l: 5, t: 18, s: 12, d: 3.2, o: 0 },
  { l: 12, t: 62, s: 8, d: 4.1, o: 1.1 },
  { l: 21, t: 34, s: 14, d: 3.6, o: 2.2 },
  { l: 32, t: 78, s: 9, d: 4.4, o: 0.6 },
  { l: 43, t: 22, s: 11, d: 3.9, o: 1.7 },
  { l: 54, t: 58, s: 15, d: 3.3, o: 2.8 },
  { l: 63, t: 30, s: 8, d: 4.6, o: 0.3 },
  { l: 72, t: 74, s: 12, d: 3.8, o: 1.4 },
  { l: 81, t: 16, s: 10, d: 4.2, o: 2.5 },
  { l: 90, t: 52, s: 13, d: 3.5, o: 0.9 },
  { l: 96, t: 80, s: 8, d: 4.8, o: 2 },
];

const CSS = `
.ft{--mx:50%;--my:30%;position:relative;isolation:isolate;overflow:hidden;color:#eaf4ff;background:
  radial-gradient(900px circle at 50% -10%,rgba(29,127,224,.22),transparent 60%),
  linear-gradient(180deg,#05070d 0%,#03040a 60%,#020306 100%)}
.ft::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:radial-gradient(520px circle at var(--mx) var(--my),rgba(74,163,240,.16),transparent 65%)}
.ft-wave{position:absolute;left:0;right:0;top:0;height:34px;overflow:hidden;pointer-events:none;opacity:.9}
.ft-wave svg{position:absolute;left:0;top:0;width:200%;height:100%;animation:ftWave 14s linear infinite}
.ft-wave svg:nth-child(2){animation-duration:22s;animation-direction:reverse;opacity:.55;top:4px}
@keyframes ftWave{to{transform:translateX(-50%)}}
.ft-orn{display:flex;align-items:center;gap:14px;justify-content:center;padding-top:14px}
.ft-orn i{height:1px;flex:1;max-width:320px;background:linear-gradient(90deg,transparent,#4aa3f0)}
.ft-orn i:last-child{background:linear-gradient(90deg,#4aa3f0,transparent)}
.ft-orn b{width:9px;height:9px;transform:rotate(45deg);background:linear-gradient(135deg,#eaf4ff,#3d9bea);box-shadow:0 0 14px rgba(74,163,240,.9);animation:ftPulse 3s ease-in-out infinite}
@keyframes ftPulse{0%,100%{opacity:.6;transform:rotate(45deg) scale(.85)}50%{opacity:1;transform:rotate(45deg) scale(1.15)}}

.ft-bubble{position:absolute;bottom:-30px;border-radius:9999px;pointer-events:none;
  background:radial-gradient(circle at 30% 28%,rgba(255,255,255,.55),rgba(140,195,245,.16) 40%,rgba(29,127,224,.06) 70%);
  border:1px solid rgba(140,195,245,.3);animation:ftRise linear infinite}
@keyframes ftRise{0%{transform:translate(0,0) scale(.6);opacity:0}12%{opacity:.9}100%{transform:translate(18px,-520px) scale(1);opacity:0}}
.ft-spark{position:absolute;pointer-events:none;color:#8cc3f5;animation:ftTwinkle ease-in-out infinite}
@keyframes ftTwinkle{0%,100%{opacity:.08;transform:scale(.5) rotate(0)}50%{opacity:.95;transform:scale(1) rotate(90deg)}}

.ft-mark{position:absolute;left:0;right:0;bottom:-2.2vw;text-align:center;pointer-events:none;user-select:none;white-space:nowrap;
  font-family:"Cormorant Garamond",Georgia,serif;font-weight:700;line-height:1;font-size:clamp(64px,17vw,250px);
  color:transparent;-webkit-text-stroke:1px rgba(140,195,245,.16)}

.ft-rib{position:relative;overflow:hidden;border-block:1px solid rgba(140,195,245,.14);background:rgba(255,255,255,.02);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.ft-rib-t{display:flex;width:max-content;animation:ftMarq 38s linear infinite}
.ft-rib:hover .ft-rib-t{animation-play-state:paused}
@keyframes ftMarq{to{transform:translateX(-50%)}}
.ft-rib span{display:inline-flex;align-items:center;gap:22px;padding:15px 22px 15px 0;white-space:nowrap;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(18px,2.4vw,24px);font-weight:600;letter-spacing:.04em;color:#cfe5fb}
.ft-rib span::after{content:"";width:7px;height:7px;transform:rotate(45deg);background:#3d9bea;box-shadow:0 0 10px #3d9bea}

@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes ftSpinA{to{--a:360deg}}
.ft-cta{position:relative;overflow:hidden;border-radius:2rem;padding:1px;
  background:conic-gradient(from var(--a),rgba(29,127,224,.1),#8cc3f5,rgba(29,127,224,.1) 40%,rgba(29,127,224,.1) 60%,#3d9bea,rgba(29,127,224,.1));animation:ftSpinA 7s linear infinite}
.ft-cta-in{position:relative;border-radius:calc(2rem - 1px);overflow:hidden;background:linear-gradient(135deg,rgba(10,16,32,.97),rgba(6,9,18,.97))}
.ft-cta-in::after{content:"";position:absolute;top:0;bottom:0;width:30%;left:-40%;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(140,195,245,.12),transparent);transform:skewX(-18deg);animation:ftSweep 6s ease-in-out infinite}
@keyframes ftSweep{0%{left:-40%}45%,100%{left:140%}}

.ft-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;overflow:hidden;border-radius:9999px;padding:14px 26px;font-size:14px;font-weight:700;letter-spacing:.03em;color:#fff;text-decoration:none;
  background:linear-gradient(120deg,#135fb8,#2f93ee 50%,#135fb8);background-size:220% 100%;box-shadow:0 14px 34px -12px rgba(29,127,224,.85);
  transition:transform .4s cubic-bezier(.2,.9,.25,1.3),background-position .6s ease,box-shadow .4s ease}
.ft-btn:hover{transform:translateY(-3px) scale(1.03);background-position:100% 0;box-shadow:0 20px 40px -12px rgba(29,127,224,1)}
.ft-btn:active{transform:scale(.96)}
.ft-btn svg{transition:transform .4s ease}
.ft-btn:hover svg{transform:translateX(5px)}
.ft-btn::after{content:"";position:absolute;top:-20%;bottom:-20%;width:34%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg);animation:ftSweep2 4.5s ease-in-out 1s infinite}
@keyframes ftSweep2{0%{left:-60%}35%,100%{left:170%}}
.ft-btn-line{background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(140,195,245,.4)}
.ft-btn-line:hover{background:rgba(140,195,245,.14);box-shadow:inset 0 0 0 1px #8cc3f5,0 14px 30px -14px rgba(74,163,240,.8)}
.ft-btn-line::after{display:none}
.ft-btn-line:hover svg{transform:scale(1.15) rotate(-8deg)}

.ft-h{position:relative;display:inline-block;font-family:"Cormorant Garamond",Georgia,serif;font-size:26px;font-weight:700;color:#8cc3f5;padding-bottom:10px}
.ft-h::after{content:"";position:absolute;left:0;bottom:0;height:2px;width:34px;border-radius:2px;background:linear-gradient(90deg,#3d9bea,transparent);transition:width .6s cubic-bezier(.2,.8,.2,1)}
.ft-col:hover .ft-h::after{width:100%}

.ft-link{position:relative;display:inline-flex;align-items:center;gap:8px;padding:5px 0;font-size:14.5px;color:rgba(234,244,255,.72);text-decoration:none;transition:color .3s ease,transform .35s cubic-bezier(.2,.8,.2,1)}
.ft-link svg{width:14px;height:14px;opacity:0;transform:translate(-8px,4px);transition:opacity .3s ease,transform .35s ease;color:#5fb0f5}
.ft-link::after{content:"";position:absolute;left:0;bottom:2px;height:1px;width:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#8cc3f5,transparent);transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.ft-link:hover{color:#fff;transform:translateX(6px)}
.ft-link:hover svg{opacity:1;transform:none}
.ft-link:hover::after{transform:scaleX(1)}

.ft-card{position:relative;display:flex;align-items:center;gap:13px;padding:11px 14px;border-radius:18px;text-decoration:none;color:rgba(234,244,255,.85);font-size:14px;line-height:1.35;
  background:linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.015));border:1px solid rgba(140,195,245,.14);
  transition:transform .4s cubic-bezier(.2,.9,.25,1.2),border-color .3s ease,background .3s ease,box-shadow .4s ease}
.ft-card:hover{transform:translateY(-3px);border-color:rgba(140,195,245,.5);background:linear-gradient(135deg,rgba(61,155,234,.18),rgba(255,255,255,.03));box-shadow:0 16px 30px -18px rgba(61,155,234,.9)}
.ft-ic{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:12px;color:#8cc3f5;background:rgba(61,155,234,.14);border:1px solid rgba(140,195,245,.25);transition:transform .5s cubic-bezier(.2,.9,.25,1.4),background .3s ease,color .3s ease}
.ft-card:hover .ft-ic{transform:rotate(-10deg) scale(1.12);background:linear-gradient(135deg,#3d9bea,#135fb8);color:#fff}
.ft-card small{display:block;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(140,195,245,.7);margin-bottom:1px}
.ft-v{display:block;min-width:0;overflow-wrap:anywhere}

.ft-soc{display:grid;place-items:center;width:46px;height:46px;border-radius:9999px;color:#cfe5fb;text-decoration:none;background:rgba(255,255,255,.05);border:1px solid rgba(140,195,245,.25);
  transition:transform .45s cubic-bezier(.2,.9,.25,1.4),background .3s ease,color .3s ease,box-shadow .4s ease}
.ft-soc svg{width:19px;height:19px;transition:transform .4s ease}
.ft-soc:hover{transform:translateY(-6px) scale(1.1);color:#fff;background:linear-gradient(135deg,#3d9bea,#135fb8);box-shadow:0 14px 26px -10px rgba(29,127,224,.95)}
.ft-soc:hover svg{transform:rotate(-8deg) scale(1.08)}
.ft-soc.wa:hover{background:linear-gradient(135deg,#25D366,#128C7E);box-shadow:0 14px 26px -10px rgba(18,140,126,.95)}

.ft-halo{position:relative;display:inline-block}
.ft-halo::before{content:"";position:absolute;inset:-16px -22px;border-radius:9999px;background:radial-gradient(closest-side,rgba(61,155,234,.35),transparent);filter:blur(10px);animation:ftBreath 5s ease-in-out infinite;z-index:-1;pointer-events:none}
@keyframes ftBreath{0%,100%{opacity:.5;transform:scale(.95)}50%{opacity:1;transform:scale(1.08)}}

.ft-live{display:inline-flex;align-items:center;gap:8px;border-radius:9999px;padding:6px 13px;font-size:11.5px;font-weight:700;letter-spacing:.08em;color:#bfe4cf;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25)}
.ft-live i{position:relative;width:8px;height:8px;border-radius:9999px;background:#34d399}
.ft-live i::after{content:"";position:absolute;inset:0;border-radius:inherit;background:#34d399;animation:ftPing 1.8s ease-out infinite}
@keyframes ftPing{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}

.ft-top{position:relative;display:grid;place-items:center;width:54px;height:54px;border-radius:9999px;color:#8cc3f5;background:rgba(255,255,255,.04);border:0;cursor:pointer;
  transition:transform .45s cubic-bezier(.2,.9,.25,1.4),color .3s ease,background .3s ease,box-shadow .4s ease}
.ft-top svg.ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.ft-top .arr{transition:transform .4s ease}
.ft-top:hover{transform:translateY(-5px);color:#fff;background:linear-gradient(135deg,#3d9bea,#135fb8);box-shadow:0 14px 28px -10px rgba(29,127,224,.95)}
.ft-top:hover .arr{transform:translateY(-3px)}
.ft-top:active{transform:scale(.92)}

.ft-credit{position:relative;display:inline-flex;border-radius:9999px;padding:1.5px;text-decoration:none;isolation:isolate;
  background:conic-gradient(from var(--a),rgba(61,155,234,.2),#bfe0ff,rgba(61,155,234,.2) 35%,rgba(61,155,234,.2) 60%,#3d9bea,#eaf4ff,rgba(61,155,234,.2));animation:ftSpinA 5s linear infinite;
  box-shadow:0 10px 30px -14px rgba(61,155,234,.9);transition:transform .45s cubic-bezier(.2,.9,.25,1.3),box-shadow .4s ease}
.ft-credit-in{position:relative;display:inline-flex;align-items:center;gap:10px;overflow:hidden;border-radius:9999px;padding:9px 18px 9px 10px;font-size:13px;font-weight:600;color:rgba(234,244,255,.85);
  background:linear-gradient(135deg,#0a1630,#050914)}
.ft-credit-in::after{content:"";position:absolute;top:0;bottom:0;width:32%;left:-60%;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(191,224,255,.3),transparent);transform:skewX(-18deg);animation:ftSweep2 4.5s ease-in-out 1.5s infinite}
.ft-credit-gem{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:9999px;color:#fff;background:linear-gradient(135deg,#3d9bea,#0a3a78);box-shadow:0 0 14px rgba(61,155,234,.8);transition:transform .5s cubic-bezier(.2,.9,.25,1.4)}
.ft-credit-gem svg{width:15px;height:15px}
.ft-credit b{font-family:"Cormorant Garamond",Georgia,serif;font-size:20px;line-height:1;font-weight:700;letter-spacing:.06em;background:linear-gradient(100deg,#5fb0f5,#ffffff 40%,#8cc3f5 60%,#5fb0f5);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ftTextShine 5s linear infinite}
@keyframes ftTextShine{to{background-position:-250% 0}}
.ft-credit .arr{width:14px;height:14px;color:#8cc3f5;transition:transform .4s ease}
.ft-credit:hover,.ft-credit:focus-visible{transform:translateY(-4px) scale(1.04);box-shadow:0 18px 36px -12px rgba(61,155,234,1);outline:none}
.ft-credit:hover .ft-credit-gem{transform:rotate(-12deg) scale(1.15)}
.ft-credit:hover .arr{transform:translate(3px,-3px)}
.ft-credit:active{transform:scale(.96)}
@media (hover:none){.ft::before{display:none}}
@media (max-width:640px){.ft-cta,.ft-cta-in{border-radius:1.5rem}.ft-h{font-size:24px}}
@media (prefers-reduced-motion:reduce){.ft *,.ft *::before,.ft *::after{animation:none!important}}
@media print{.ft{display:none}}
`;

function FLink({ to, children }) {
  return (
    <Link to={to} className="ft-link">
      {children}
      <ArrowUpRight />
    </Link>
  );
}

function InfoCard({ icon: Icon, label, href, external, children }) {
  const inner = (
    <>
      <span className="ft-ic">
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <small>{label}</small>
        <span className="ft-v">{children}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a
          className="ft-card"
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {inner}
        </a>
      ) : (
        <div className="ft-card">{inner}</div>
      )}
    </li>
  );
}

export default function Footer() {
  const { country } = useGeo();
  const brand = brandFor(country.code);
  const isPK = country.code === "PK";
  const rootRef = useRef(null);
  const ringRef = useRef(null);

  // Mouse ke saath chalne wali soft roshni (sirf desktop; state nahi, isliye re-render zero)
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !window.matchMedia("(hover:hover)").matches) return;
    let raf = 0;
    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    el.addEventListener("pointermove", move, { passive: true });
    return () => {
      el.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Back-to-top ring: scroll ke hisaab se bharta hai
  useEffect(() => {
    const C = 2 * Math.PI * 25;
    let raf = 0;
    const draw = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
      if (ringRef.current)
        ringRef.current.style.strokeDashoffset = String(C * (1 - p));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const waText = encodeURIComponent(
    isPK
      ? "Assalam o Alaikum! I would like to know more about your products."
      : "Hello! I would like to know more about your mithai.",
  );
  const waHref = `https://wa.me/${digits(country.phone)}?text=${waText}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.city)}`;
  const hasSweets = country.categories.includes("sweets");
  const C = 2 * Math.PI * 25;

  const ribbon = isPK
    ? [
        "Pure Drinking Water",
        "Tested & sealed fresh",
        "Cash on delivery",
        "Home & office delivery",
        "19 L · 1.5 L · 500 ml",
      ]
    : [
        "Handcrafted Mithai",
        "Pure ghee · Real khoya",
        "Pay on delivery",
        SHOP_INFO.delivery.title,
        "Special event boxes",
      ];

  const exploreLinks = [
    ["About us", "/about"],
    ["Our services", "/services"],
    ["Why choose us", "/why-us"],
    ["Contact", "/contact"],
  ];
  const shopLinks = [
    ...country.categories.map((c) => [CATEGORIES[c].label, `/shop?cat=${c}`]),
    ["All products", "/shop"],
    ["Checkout", "/cart"],
  ];

  return (
    <footer ref={rootRef} className="ft mt-12">
      <style>{CSS}</style>

      {/* Top divider: Pakistan = behti lehrein, USA = nafees diamond line */}
      {isPK ? (
        <div className="ft-wave" aria-hidden="true">
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 1440 34" preserveAspectRatio="none">
              <path
                d="M0 17 Q90 0 180 17 T360 17 T540 17 T720 17 T900 17 T1080 17 T1260 17 T1440 17 V0 H0Z"
                fill="rgba(61,155,234,.22)"
              />
              <path
                d="M0 17 Q90 0 180 17 T360 17 T540 17 T720 17 T900 17 T1080 17 T1260 17 T1440 17"
                fill="none"
                stroke="#4aa3f0"
                strokeWidth="1.2"
                opacity=".8"
              />
            </svg>
          ))}
        </div>
      ) : (
        <div className="ft-orn" aria-hidden="true">
          <i />
          <b />
          <i />
        </div>
      )}

      {/* Floating decoration + watermark */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {isPK
          ? BUBBLES.map((b, i) => (
              <span
                key={i}
                className="ft-bubble"
                style={{
                  left: `${b.l}%`,
                  width: b.s,
                  height: b.s,
                  animationDuration: `${b.d}s`,
                  animationDelay: `-${b.o}s`,
                }}
              />
            ))
          : SPARKS.map((s, i) => (
              <Sparkles
                key={i}
                className="ft-spark"
                style={{
                  left: `${s.l}%`,
                  top: `${s.t}%`,
                  width: s.s,
                  height: s.s,
                  animationDuration: `${s.d}s`,
                  animationDelay: `${s.o}s`,
                }}
              />
            ))}
        <div className="ft-mark">{brand.name}</div>
      </div>

      {/* ============ Call to action ============ */}
      <div className="container-x relative pt-16 sm:pt-20">
        <Reveal>
          <div className="ft-cta">
            <div className="ft-cta-in flex flex-col items-start justify-between gap-7 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <span className="ft-live">
                  <i /> {isPK ? "NOW DELIVERING" : "NOW TAKING ORDERS"}
                </span>
                <h3 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
                  {isPK ? "Pure water, " : "Taste the "}
                  <span className="gold-text">
                    {isPK ? "delivered fresh." : "tradition."}
                  </span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-champ-100/70">
                  {isPK
                    ? "Order in two minutes and pay when it arrives. No account needed."
                    : "Order in two minutes and pay on delivery. No account needed."}
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link to="/shop" className="ft-btn">
                  Order now <ArrowRight size={16} />
                </Link>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-btn ft-btn-line"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={WA_PATH} />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ============ Main columns ============ */}
      <div className="container-x relative grid gap-x-10 gap-y-12 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:py-16">
        <Reveal className="ft-col sm:col-span-2 lg:col-span-4">
          <span className="ft-halo">
            <Logo light />
          </span>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-champ-100/70">
            {isPK
              ? "Evelyn One purified drinking water, tested and sealed fresh. Delivered to your door with care."
              : "Made in small batches with pure ghee, real khoya and patience."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="ft-soc"
              href={tel(country.phone)}
              aria-label="Call us"
              title="Call"
            >
              <Phone />
            </a>
            <a
              className="ft-soc wa"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={WA_PATH} />
              </svg>
            </a>
            <a
              className="ft-soc"
              href={`mailto:${brand.email}`}
              aria-label="Email us"
              title="Email"
            >
              <Mail />
            </a>
            <a
              className="ft-soc"
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Find us on map"
              title="Map"
            >
              <MapPin />
            </a>
          </div>
          <div className="mt-6 inline-flex items-center gap-2.5 text-xs font-semibold tracking-wide text-champ-200/80">
            {isPK ? (
              <Droplets size={15} className="text-champ-400" />
            ) : (
              <ShieldCheck size={15} className="text-champ-400" />
            )}
            {isPK
              ? "Tested · Sealed · Delivered fresh"
              : "Fresh · Handcrafted · Quality checked"}
          </div>
        </Reveal>

        <Reveal delay={90} className="ft-col lg:col-span-2">
          <h4 className="ft-h">Explore</h4>
          <ul className="mt-4 flex flex-col">
            {exploreLinks.map(([t, to]) => (
              <li key={to}>
                <FLink to={to}>{t}</FLink>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={170} className="ft-col lg:col-span-2">
          <h4 className="ft-h">Shop</h4>
          <ul className="mt-4 flex flex-col">
            {shopLinks.map(([t, to]) => (
              <li key={to}>
                <FLink to={to}>{t}</FLink>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={250} className="ft-col sm:col-span-2 lg:col-span-4">
          <h4 className="ft-h">Contact</h4>
          <ul className="mt-4 grid gap-2.5">
            {country.owner && (
              <InfoCard icon={UserRound} label="Owner">
                {country.owner}
              </InfoCard>
            )}
            <InfoCard icon={Phone} label="Call" href={tel(country.phone)}>
              {country.phone}
            </InfoCard>
            {country.phone2 && (
              <InfoCard icon={Phone} label="Call" href={tel(country.phone2)}>
                {country.phone2}
              </InfoCard>
            )}
            <InfoCard icon={Mail} label="Email" href={`mailto:${brand.email}`}>
              {brand.email}
            </InfoCard>
            <InfoCard icon={MapPin} label="Visit" href={mapHref} external>
              {country.city}
            </InfoCard>
            {hasSweets && (
              <>
                <InfoCard icon={Truck} label="Delivery">
                  {SHOP_INFO.delivery.title} (
                  {SHOP_INFO.delivery.note.replace(".", "")})
                </InfoCard>
                <InfoCard icon={Gift} label="Special Box">
                  ${SHOP_INFO.special.box.price} · {SHOP_INFO.special.box.pieces}{" "}
                  pieces
                  <span className="mt-0.5 block text-xs text-champ-100/50">
                    Special rates for weddings, birthdays and baby born.
                  </span>
                </InfoCard>
              </>
            )}
          </ul>
        </Reveal>
      </div>

      {/* ============ Ribbon ============ */}
      <div className="ft-rib" aria-hidden="true">
        <div className="ft-rib-t">
          {[0, 1].map((k) => (
            <div key={k} className="flex">
              {[...ribbon, ...ribbon].map((t, i) => (
                <span key={`${k}-${i}`}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ Bottom bar ============ */}
      <div className="relative">
        <div className="container-x flex flex-col items-center gap-5 pb-24 pt-8 text-center text-xs text-champ-100/60 sm:flex-row sm:justify-between sm:pb-8 sm:pr-24 sm:text-left">
          <div>
            <div className="font-display text-xl font-bold text-champ-200">
              {brand.name}
            </div>
            <span>
              © {new Date().getFullYear()} {brand.name}. All rights reserved.
            </span>
          </div>
          <a
            href="https://pantrix-flax.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="ft-credit"
            aria-label="Website made by Pantrix. Opens the Pantrix portfolio in a new tab"
            title="View Pantrix portfolio"
          >
            <span className="ft-credit-in">
              <span className="ft-credit-gem" aria-hidden="true">
                <Code2 />
              </span>
              Website made by <b>Pantrix</b>
              <ArrowUpRight className="arr" />
            </span>
          </a>
          <button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="ft-top"
          >
            <svg className="ring" viewBox="0 0 54 54" aria-hidden="true">
              <circle
                cx="27"
                cy="27"
                r="25"
                fill="none"
                stroke="rgba(140,195,245,.22)"
                strokeWidth="2"
              />
              <circle
                ref={ringRef}
                cx="27"
                cy="27"
                r="25"
                fill="none"
                stroke="#5fb0f5"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C}
              />
            </svg>
            <ArrowUp size={18} className="arr" />
          </button>
        </div>
      </div>
    </footer>
  );
}
