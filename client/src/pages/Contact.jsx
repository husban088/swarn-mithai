import { useState } from "react";
import { Mail, MapPin, Phone, Send, UserRound } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { api, json } from "../lib/api";
import { brandFor } from "../config";
import { useGeo, useToast } from "../store";

export default function Contact() {
  const { country } = useGeo();
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/contact", json("POST", { ...f, country: country?.code }));
      toast("Message sent. We will reply soon.");
      setF({ name: "", email: "", message: "" });
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const info = [
    ...(country.owner ? [{ i: UserRound, t: "Owner", v: country.owner }] : []),
    {
      i: Phone,
      t: "Call us",
      v: country.phone,
      href: `tel:${country.phone.replace(/[^+\d]/g, "")}`,
    },
    ...(country.phone2
      ? [
          {
            i: Phone,
            t: "Call us (2nd number)",
            v: country.phone2,
            href: `tel:${country.phone2.replace(/[^+\d]/g, "")}`,
          },
        ]
      : []),
    {
      i: Mail,
      t: "Email",
      v: brandFor(country.code).email,
      href: `mailto:${brandFor(country.code).email}`,
      small: true,
    },
    { i: MapPin, t: "Address", v: country.city, small: true },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Let us"
        accent="talk"
        text={
          country.categories.includes("sweets")
            ? "Questions about an order, a wedding box or bulk water delivery? Send a message and we will answer by email."
            : "Questions about an order, regular refills or bulk water delivery? Send a message and we will answer by email."
        }
      />
      <div className="container-x grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {info.map(({ i: Icon, t, v, href, small }, k) => (
            <Reveal key={t} delay={k * 100}>
              <div className="card-lux group flex items-center gap-5 p-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full champ-bg text-royal transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <Icon size={22} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-champ-500">
                    {t}
                  </div>
                  <div
                    className={`break-words font-display font-bold text-royal ${small ? "text-xl sm:text-2xl" : "text-2xl"}`}
                  >
                    {href ? (
                      <a
                        href={href}
                        className="transition hover:text-champ-600"
                      >
                        {v}
                      </a>
                    ) : (
                      v
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <form
            onSubmit={send}
            className="space-y-4 rounded-3xl border border-champ-200 bg-white p-6 shadow-2xl shadow-champ-200/40 sm:p-9"
          >
            <h2 className="font-display text-4xl font-bold text-royal">
              Send a message
            </h2>
            <div>
              <label className="label">Your name</label>
              <input
                className="field"
                value={f.name}
                onChange={set("name")}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="field"
                value={f.email}
                onChange={set("email")}
                required
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                rows={5}
                className="field"
                value={f.message}
                onChange={set("message")}
                required
              />
            </div>
            <button disabled={busy} className="btn-gold w-full !py-3.5">
              {busy ? (
                <span className="ring-loader ring-loader-sm" />
              ) : (
                <Send size={16} />
              )}
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
