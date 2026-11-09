import { useRef, useState } from "react";
import {
  ArrowUpRight,
  AtSign,
  Check,
  Copy,
  Droplets,
  Gift,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import FieldError from "../components/FieldError";
import { api, json } from "../lib/api";
import { BANK, SHOP_INFO, brandFor } from "../config";
import { vEmail, vName, vPhone } from "../lib/validate";
import { useGeo, useToast } from "../store";
import "./Contact.css";

const digits = (s) => String(s || "").replace(/[^\d]/g, "");

// Mouse ke saath roshni chalane ke liye (spotlight)
const spot = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

// Floating-label input / textarea
function Field({ id, label, icon: Icon, error, multiline, ...rest }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div>
      <div className={`cf ${error ? "cf-err" : ""}`}>
        <Tag
          id={id}
          placeholder=" "
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-err` : undefined}
          className="cf-input"
          {...rest}
        />
        <label htmlFor={id} className="cf-label">
          {label}
        </label>
        <Icon size={18} className="cf-ico" />
      </div>
      <FieldError id={`${id}-err`} msg={error} />
    </div>
  );
}

export default function Contact() {
  const { country } = useGeo();
  const toast = useToast();
  const brand = brandFor(country.code);
  const hasSweets = country.categories.includes("sweets");
  const hasAqua = country.categories.includes("aqua");

  const topics = [
    "Existing order",
    ...(hasSweets ? ["Mithai order", "Wedding / event box"] : []),
    ...(hasAqua ? ["Bulk water delivery", "Regular refills"] : []),
    "Something else",
  ];

  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [topic, setTopic] = useState(topics[0]);
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState("");
  const copyTimer = useRef(null);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const errs = {
    name: vName(f.name),
    email: vEmail(f.email),
    phone: vPhone(f.phone, false),
    message:
      f.message.trim().length < 10
        ? "Please write at least 10 characters so we can help properly."
        : "",
  };
  const show = (k) => (touched[k] ? errs[k] : "");

  const send = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (Object.values(errs).some(Boolean)) {
      setTouched({ name: true, email: true, phone: true, message: true });
      toast("Please fix the highlighted fields.", "err");
      return;
    }
    setBusy(true);
    try {
      // Name / email / phone / topic / message alag alag jate hain (Admin -> Contacts me dikhte hain)
      await api(
        "/contact",
        json("POST", {
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          topic,
          message: f.message.trim(),
          country: country?.code,
        }),
      );
      toast("Message sent. We will reply soon.");
      setF({ name: "", email: "", phone: "", message: "" });
      setTouched({});
      setDone(true);
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 1600);
    } catch {
      toast("Copy not supported on this browser.", "err");
    }
  };

  const tel = (p) => `tel:${p.replace(/[^+\d]/g, "")}`;
  const waNumber =
    country.code === "US" ? BANK.whatsapp : digits(country.phone);
  const email = brand.email;
  const mapQ = encodeURIComponent(country.city);

  const info = [
    ...(country.owner
      ? [{ k: "owner", i: UserRound, t: "Owner", v: country.owner }]
      : []),
    {
      k: "p1",
      i: Phone,
      t: "Call us",
      v: country.phone,
      href: tel(country.phone),
      copy: country.phone,
    },
    ...(country.phone2
      ? [
          {
            k: "p2",
            i: Phone,
            t: "Call us (2nd number)",
            v: country.phone2,
            href: tel(country.phone2),
            copy: country.phone2,
          },
        ]
      : []),
    {
      k: "mail",
      i: Mail,
      t: "Email",
      v: email,
      href: `mailto:${email}`,
      copy: email,
      small: true,
    },
    {
      k: "addr",
      i: MapPin,
      t: "Address",
      v: country.city,
      href: `https://www.google.com/maps/search/?api=1&query=${mapQ}`,
      external: true,
      small: true,
    },
  ];

  const good = [
    country.code === "US"
      ? {
          i: Truck,
          t: SHOP_INFO.delivery.title,
          d: SHOP_INFO.delivery.note + " Pay on delivery.",
        }
      : {
          i: Truck,
          t: "Cash on delivery",
          d: "Pay at your doorstep across Pakistan.",
        },
    ...(hasSweets
      ? [{ i: Gift, t: SHOP_INFO.special.title, d: SHOP_INFO.special.text }]
      : []),
    ...(hasAqua
      ? [
          {
            i: Droplets,
            t: "Bulk & regular water",
            d: "Home, office or event refills. Tell us your quantity and we will plan it.",
          },
        ]
      : []),
    { i: ShieldCheck, t: brand.name, d: brand.blurb },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Let us"
        accent="talk"
        text={
          hasSweets
            ? "Questions about an order, a wedding box or bulk water delivery? Send a message and we will answer by email."
            : "Questions about an order, regular refills or bulk water delivery? Send a message and we will answer by email."
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={tel(country.phone)} className="btn-champ">
            <Phone size={16} /> Call now
          </a>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost-light"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href={`mailto:${email}`} className="btn-ghost-light">
            <Mail size={16} /> Email us
          </a>
        </div>
      </PageHero>

      <section className="relative overflow-hidden">
        {/* background decor */}
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-champ-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-champ-400/15 blur-3xl" />
        <div className="ct-float pointer-events-none absolute right-[6%] top-16 hidden h-24 w-24 rounded-full border border-champ-300/50 lg:block" />

        <div className="container-x relative grid items-start gap-10 py-14 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* ---------- LEFT: info + map ---------- */}
          <div className="min-w-0 space-y-5">
            <Reveal>
              <span className="eyebrow">Reach us</span>
              <h2 className="title-lg mt-3">
                We are one{" "}
                <span className="bg-gradient-to-r from-champ-600 to-champ-400 bg-clip-text text-transparent">
                  message
                </span>{" "}
                away
              </h2>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {info.map(
                (
                  { k, i: Icon, t, v, href, small, copy: cp, external },
                  idx,
                ) => (
                  <Reveal key={k} delay={idx * 90} className="min-w-0">
                    <div
                      onMouseMove={spot}
                      className="ct-card ct-spot group flex items-center gap-4 p-5 sm:p-6"
                    >
                      <span className="ct-icon">
                        <Icon size={22} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-champ-500">
                          {t}
                        </div>
                        <div
                          className={`font-display font-bold leading-snug text-royal [overflow-wrap:anywhere] ${small ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}
                        >
                          {href ? (
                            <a
                              href={href}
                              {...(external
                                ? { target: "_blank", rel: "noreferrer" }
                                : {})}
                              className="link-draw transition hover:text-champ-600"
                            >
                              {v}
                            </a>
                          ) : (
                            v
                          )}
                        </div>
                      </div>
                      {cp && (
                        <button
                          type="button"
                          onClick={() => copy(cp, k)}
                          aria-label={`Copy ${t}`}
                          title="Copy"
                          className="ct-copy"
                        >
                          {copied === k ? (
                            <Check size={15} />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      )}
                      {external && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open in Maps"
                          title="Open in Maps"
                          className="ct-copy"
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      )}
                    </div>
                  </Reveal>
                ),
              )}
            </div>

            <Reveal delay={200}>
              <div className="ct-map group relative overflow-hidden rounded-3xl border border-champ-200 bg-white shadow-xl shadow-champ-200/40">
                <iframe
                  title={`${brand.name} location`}
                  src={`https://www.google.com/maps?q=${mapQ}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-56 w-full border-0 sm:h-64"
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-royal absolute bottom-3 right-3 !px-4 !py-2 text-xs shadow-xl"
                >
                  <Navigation size={14} /> Get directions
                </a>
              </div>
            </Reveal>
          </div>

          {/* ---------- RIGHT: form ---------- */}
          <Reveal delay={120} className="min-w-0 lg:sticky lg:top-24">
            <div className="ct-form overflow-hidden">
              {/* dark header */}
              <div className="grain bg-royal relative px-6 py-7 sm:px-9 sm:py-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-glow rounded-full bg-champ-400/30 blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-champ-300/30 bg-white/10 text-champ-200">
                    <MessageSquareText size={22} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                      Send a <span className="gold-text">message</span>
                    </h2>
                    <p className="mt-0.5 text-xs text-champ-100/70 sm:text-sm">
                      {brand.name} · we reply by email
                    </p>
                  </div>
                </div>
              </div>

              {done ? (
                <div className="px-6 py-14 text-center sm:px-9">
                  <span className="ct-tick-wrap mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-royal via-gold-700 to-champ-500 text-white">
                    <svg
                      viewBox="0 0 24 24"
                      width="44"
                      height="44"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path className="ct-tick" d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  <h3 className="mt-6 font-display text-4xl font-bold text-royal">
                    Thank you!
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">
                    Your message has reached {brand.name}. We will reply to your
                    email very soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className="btn-line mt-7"
                  >
                    <Send size={15} /> Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={send}
                  noValidate
                  className="space-y-5 px-5 py-7 sm:px-9 sm:py-9"
                >
                  <div>
                    <div className="label !mb-2.5 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-champ-500" /> What is
                      this about?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={topic === t}
                          onClick={() => setTopic(t)}
                          className="ct-chip"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="ct-name"
                      label="Your name"
                      icon={UserRound}
                      value={f.name}
                      onChange={set("name")}
                      onBlur={blur("name")}
                      error={show("name")}
                      autoComplete="name"
                    />
                    <Field
                      id="ct-phone"
                      label="Phone (optional)"
                      icon={Phone}
                      type="tel"
                      inputMode="tel"
                      value={f.phone}
                      onChange={set("phone")}
                      onBlur={blur("phone")}
                      error={show("phone")}
                      autoComplete="tel"
                    />
                  </div>
                  <Field
                    id="ct-email"
                    label="Email address"
                    icon={AtSign}
                    type="email"
                    value={f.email}
                    onChange={set("email")}
                    onBlur={blur("email")}
                    error={show("email")}
                    autoComplete="email"
                  />
                  <div>
                    <Field
                      id="ct-msg"
                      label="Your message"
                      icon={MessageSquareText}
                      multiline
                      rows={5}
                      maxLength={1500}
                      value={f.message}
                      onChange={set("message")}
                      onBlur={blur("message")}
                      error={show("message")}
                    />
                    <div className="mt-1.5 text-right text-[11px] font-semibold text-neutral-400">
                      {f.message.length}/1500
                    </div>
                  </div>

                  <button disabled={busy} className="btn-gold w-full !py-4">
                    {busy ? (
                      <span className="ring-loader ring-loader-sm" />
                    ) : (
                      <Send size={16} />
                    )}
                    {busy ? "Sending…" : "Send message"}
                  </button>
                  <p className="text-center text-[11px] text-neutral-500">
                    Your details are only used to reply to your message.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Good to know ---------- */}
      <section className="bg-royal-deep grain relative overflow-hidden">
        <div className="container-x relative py-14 sm:py-16">
          <Reveal>
            <div className="mb-8 text-center">
              <span className="eyebrow !text-champ-300">Good to know</span>
              <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
                Before you <span className="gold-text">write</span>
              </h2>
            </div>
          </Reveal>
          <div
            className={`grid gap-4 sm:grid-cols-2 ${good.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
          >
            {good.map(({ i: Icon, t, d }, k) => (
              <Reveal key={t} delay={k * 100} className="min-w-0">
                <div
                  onMouseMove={spot}
                  className="ct-spot card-glow group h-full rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition duration-500 hover:-translate-y-2 hover:bg-white/[0.09]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl champ-bg text-royal transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white">
                    {t}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-champ-100/70">
                    {d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="hairline absolute inset-x-0 top-0" />
      </section>
    </div>
  );
}
