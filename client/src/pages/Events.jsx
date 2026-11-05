import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  Baby,
  Cake,
  CalendarHeart,
  Gift,
  Heart,
  MessageCircle,
  PackageCheck,
  Truck,
} from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { SHOP_INFO } from "../config";
import { useGeo, useShop } from "../store";

/* ------------------------------------------------------------------ */
/* EVENT IMAGES  ->  client/public/events/                              */
/*   wedding.jpg   birthday.jpg   baby-born.jpg                          */
/*   gallery-1.jpg ... gallery-6.jpg  (gallery me wahi dikhti hain jo hon) */
/* Image na ho to hero/mithai-2.jpg ka hissa dikhta hai.                */
/* ------------------------------------------------------------------ */
const FALLBACK = "/hero/mithai-2.jpg";

const EVENTS = [
  {
    key: "weddings",
    label: "Weddings",
    icon: Heart,
    img: "/events/wedding.jpg",
    title: "Nikah, mehndi & walima",
    text: "Gift-ready Special Boxes for your guests and family. Hand-rolled mithai in small batches, with special rates for wedding orders.",
    points: [
      "Bulk orders at special rates",
      "Gift-ready 16-piece boxes",
      "Pick your favourites from 20 varieties",
    ],
  },
  {
    key: "birthdays",
    label: "Birthdays",
    icon: Cake,
    img: "/events/birthday.jpg",
    title: "Sweet boxes for every party",
    text: "Make the party sweeter. Share a Special Box with friends and family, or send one as a birthday gift.",
    points: [
      "Perfect for return gifts",
      "Fresh, made to order",
      "Delivered to your door",
    ],
  },
  {
    key: "baby",
    label: "Baby Born",
    icon: Baby,
    img: "/events/baby-born.jpg",
    title: "Celebrate a new arrival",
    text: "Share the happy news the traditional way. Beautiful boxes of fresh mithai for relatives, neighbours and friends.",
    points: [
      "Traditional mithai, fresh",
      "Special event rates",
      "Elegant gift boxes",
    ],
  },
];

// Poori image, apni asli ratio me: na crop, na stretch, na khali jagah.
// Event ki apni image na mile to poori mithai-2.jpg dikhti hai.
function EventImg({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [fbFailed, setFbFailed] = useState(false);
  if (failed && fbFailed)
    return (
      <span
        className="block aspect-[16/9] w-full bg-royal"
        aria-hidden="true"
      />
    );
  return (
    <img
      key={failed ? "fb" : "own"}
      src={failed ? FALLBACK : src}
      alt={alt}
      width={1672}
      height={941}
      loading="lazy"
      draggable={false}
      onError={() => (failed ? setFbFailed(true) : setFailed(true))}
      className="block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
    />
  );
}

const GALLERY = [1, 2, 3, 4, 5, 6].map((n) => `/events/gallery-${n}.jpg`);

function Gallery() {
  const [bad, setBad] = useState({});
  const [ok, setOk] = useState({});
  const shown = GALLERY.filter((s) => !bad[s]);
  const anyLoaded = Object.keys(ok).length > 0;
  // Jab tak koi image load na ho, section chhupa rehta hai (khali section na dikhe)
  return (
    <section className={`container-x pb-20 ${anyLoaded ? "" : "hidden"}`}>
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Gallery</span>
        <h2 className="title-lg mt-3">Moments we have sweetened</h2>
      </Reveal>
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {shown.map((s, i) => (
          <div
            key={s}
            className={`mb-4 break-inside-avoid overflow-hidden rounded-3xl shadow-[0_24px_60px_-34px_rgba(11,11,13,.45)] ${ok[s] ? "" : "hidden"}`}
          >
            <img
              src={s}
              alt={`Event ${i + 1}`}
              loading="lazy"
              draggable={false}
              onLoad={() => setOk((o) => ({ ...o, [s]: true }))}
              onError={() => setBad((b) => ({ ...b, [s]: true }))}
              className="block h-auto w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    icon: Gift,
    t: "Pick your box",
    d: "Choose the Special Box and your favourite mithai from 20 varieties.",
  },
  {
    n: "02",
    icon: MessageCircle,
    t: "Tell us your event",
    d: "Wedding, birthday or baby born? Tell us the date and how many boxes you need.",
  },
  {
    n: "03",
    icon: PackageCheck,
    t: "We make it fresh",
    d: "Hand-rolled in small batches with pure desi ghee and real khoya.",
  },
  {
    n: "04",
    icon: Truck,
    t: "Delivered to you",
    d: `${SHOP_INFO.delivery.title}. ${SHOP_INFO.delivery.note}`,
  },
];

export default function Events() {
  const { country } = useGeo();
  const { products } = useShop();
  // Events sirf Mithai House (mithai) ke liye
  if (!country.categories.includes("sweets"))
    return <Navigate to="/" replace />;

  const { special } = SHOP_INFO;
  const box = products.find((p) => /special/i.test(p.name));
  const boxTo = box ? `/product/${box.id}` : "/shop";

  return (
    <div>
      <PageHero
        eyebrow="Weddings · Birthdays · Baby born"
        title="Mithai for your"
        accent="special day"
        crumb="Events"
        text={`${special.text} A gift-ready ${special.box.name} of ${special.box.pieces} pieces for just $${special.box.price}.`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={boxTo} className="btn-champ">
            Order a Special Box <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-ghost-light">
            Event enquiry
          </Link>
        </div>
      </PageHero>

      {/* Offer banner */}
      <section className="container-x py-14 sm:py-20">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-royal/10 bg-royal shadow-[0_40px_80px_-35px_rgba(11,11,13,.7)]">
            <img
              src={FALLBACK}
              alt="Special boxes for your special day: weddings, birthdays and baby born"
              className="block h-auto w-full"
              draggable={false}
            />
          </div>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              i: Gift,
              t: `${special.box.pieces} pieces`,
              d: "Gift-ready Special Box",
            },
            {
              i: CalendarHeart,
              t: `$${special.box.price} per box`,
              d: "Special rates for events",
            },
            {
              i: Truck,
              t: SHOP_INFO.delivery.short,
              d: SHOP_INFO.delivery.note,
            },
          ].map((x, k) => (
            <Reveal key={x.t} delay={k * 90}>
              <div className="flex items-center gap-4 rounded-2xl border border-champ-200 bg-white p-4 shadow-sm">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-royal text-white">
                  <x.i size={20} />
                </span>
                <span className="text-sm">
                  <b className="block text-royal">{x.t}</b>
                  <span className="text-neutral-500">{x.d}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Occasions */}
      <section className="container-x pb-16 sm:pb-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Our events</span>
          <h2 className="title-lg mt-3">Every celebration, sweetened</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {EVENTS.map((e, k) => (
            <Reveal key={e.key} delay={k * 100} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-royal/10 bg-white shadow-[0_24px_60px_-34px_rgba(11,11,13,.45)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_34px_70px_-30px_rgba(29,127,224,.55)]">
                <div className="relative overflow-hidden bg-royal">
                  <EventImg src={e.img} alt={`${e.title} - ${e.label}`} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/30 bg-champ-100 px-3.5 py-1.5 text-xs font-bold text-royal">
                    <e.icon size={14} className="text-gold-500" />
                    {e.label}
                  </span>
                  <h3 className="font-display text-3xl font-bold leading-tight text-royal">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {e.text}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-[13px] font-semibold text-royal">
                    {e.points.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={boxTo}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-gold-600 transition-all group-hover:gap-3"
                  >
                    Order for {e.label.toLowerCase()} <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Gallery />

      {/* How it works */}
      <section className="grain relative overflow-hidden bg-royal py-16 sm:py-20">
        <div className="container-x relative">
          <Reveal className="text-center">
            <span className="eyebrow !text-champ-300">Simple process</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              How event orders work
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, k) => (
              <Reveal key={s.n} delay={k * 100}>
                <div className="h-full rounded-3xl border border-champ-300/20 bg-white/[0.04] p-7 transition duration-500 hover:-translate-y-2 hover:border-champ-300/60">
                  <span className="flex items-center justify-between">
                    <span className="gold-text font-display text-5xl font-bold">
                      {s.n}
                    </span>
                    <s.icon size={22} className="text-champ-300" />
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-champ-100">
                    {s.t}
                  </h3>
                  <p className="mt-1 text-sm text-champ-100/70">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center sm:py-20">
        <Reveal>
          <h2 className="title-lg">Planning something special?</h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-600">
            Tell us about your event and how many boxes you need. We will get
            back to you.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to={boxTo} className="btn-gold">
              Order a Special Box <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-line">
              Contact us
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
