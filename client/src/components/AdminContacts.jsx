import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Inbox,
  Mail,
  MailOpen,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { api, json } from "../lib/api";
import { BANK, COUNTRIES, brandFor } from "../config";
import { useToast } from "../store";
import { useAdminScope } from "../lib/adminScope";

const digits = (s) => String(s || "").replace(/[^\d]/g, "");
const tel = (p) => `tel:${String(p || "").replace(/[^+\d]/g, "")}`;

const STATUS = {
  new: {
    label: "New",
    pill: "bg-gold-500 text-white shadow-md shadow-gold-500/30",
    dot: "bg-gold-500",
  },
  read: {
    label: "Read",
    pill: "bg-royal-soft text-neutral-600 ring-1 ring-gold-200",
    dot: "bg-neutral-300",
  },
  replied: {
    label: "Replied",
    pill: "bg-royal text-white",
    dot: "bg-royal",
  },
};

const ago = (d) => {
  const t = new Date(d).getTime();
  if (!t) return "";
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const dd = Math.round(h / 24);
  if (dd < 7) return `${dd} day${dd === 1 ? "" : "s"} ago`;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fullDate = (d) => {
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// Mouse ke saath roshni chalane ke liye
const spot = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

// Is region (USA / Pakistan) ki apni contact details: phone, email, address
function ShopContact({ sc }) {
  const toast = useToast();
  const [copied, setCopied] = useState("");
  const c = COUNTRIES[sc.country] || COUNTRIES.US;
  const brand = brandFor(sc.country);
  const phones = [c.phone, c.phone2].filter(Boolean);
  const wa = sc.country === "US" ? BANK.whatsapp : digits(c.phone);
  const rows = [
    ...phones.map((p, i) => ({
      k: `p${i}`,
      icon: Phone,
      label: i === 0 ? "Phone" : "Phone (2nd)",
      value: p,
      href: tel(p),
    })),
    {
      k: "mail",
      icon: Mail,
      label: "Email",
      value: brand.email,
      href: `mailto:${brand.email}`,
    },
    {
      k: "addr",
      icon: MapPin,
      label: "Address",
      value: c.city,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.city)}`,
      external: true,
    },
  ];

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      toast("Copy not supported on this browser.", "err");
    }
  };

  return (
    <div className="grain relative overflow-hidden rounded-[28px] bg-royal p-5 text-white shadow-2xl shadow-royal/20 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-300">
            <span className="text-base leading-none">{c.flag}</span>
            {c.name} contact details
          </span>
          <h2 className="mt-3 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">
            {sc.brand} <span className="gold-text">contact desk</span>
          </h2>
          <p className="mt-1 text-xs text-white/60 sm:text-sm">
            Customers ko yahi details Contact page par dikhti hain.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={tel(c.phone)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-royal transition hover:-translate-y-0.5 hover:shadow-lg sm:text-sm"
          >
            <Phone size={14} /> Call
          </a>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:text-sm"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map(({ k, icon: Icon, label, value, href, external }) => (
          <div
            key={k}
            onMouseMove={spot}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition duration-500 hover:-translate-y-1 hover:border-gold-300/40 hover:bg-white/[0.1]"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-royal transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
                  {label}
                </div>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="mt-0.5 block text-sm font-semibold leading-snug text-white [overflow-wrap:anywhere] hover:text-gold-300"
                >
                  {value}
                </a>
              </div>
              <button
                type="button"
                onClick={() => copy(value, k)}
                aria-label={`Copy ${label}`}
                title="Copy"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                {copied === k ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-gold-200 bg-white p-4 transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-200/60 sm:p-5">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold-100 opacity-70 transition duration-500 group-hover:scale-150" />
      <div className="relative flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 ${tone}`}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <div className="font-display text-3xl font-bold leading-none text-royal sm:text-4xl">
            {value}
          </div>
          <div className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageCard({ m, open, onToggle, onStatus, onDelete, busy }) {
  const st = STATUS[m.status] || STATUS.new;
  const initial = (m.name || "?").trim().charAt(0).toUpperCase();
  const replySubject = encodeURIComponent(
    `Re: ${m.topic || "your message"} - ${m.country === "PK" ? "Apna Pani" : "Mithai House"}`,
  );
  const waNum = digits(m.phone);

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-white transition duration-500 ${open ? "border-gold-400 shadow-2xl shadow-gold-200/70" : "border-gold-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-xl hover:shadow-gold-100"}`}
    >
      {m.status === "new" && (
        <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-gold-300 via-gold-500 to-gold-700" />
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-royal font-display text-2xl font-bold text-white transition duration-500 group-hover:rotate-6 sm:h-12 sm:w-12">
          {initial}
          {m.status === "new" && (
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-white bg-gold-500" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 max-w-full truncate font-display text-xl font-bold leading-tight text-royal sm:text-2xl">
              {m.name}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${st.pill}`}
            >
              {st.label}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
            <span className="min-w-0 max-w-full truncate [overflow-wrap:anywhere]">
              {m.email}
            </span>
            <span className="text-neutral-300">•</span>
            <span title={fullDate(m.created_at)}>{ago(m.created_at)}</span>
          </div>
          {m.topic && (
            <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700">
              <Sparkles size={11} className="shrink-0" />
              <span className="truncate">{m.topic}</span>
            </span>
          )}
          {!open && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
              {m.message}
            </p>
          )}
        </div>

        <ChevronDown
          size={20}
          className={`mt-1 shrink-0 text-gold-600 transition duration-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* khula hua detail: grid-rows trick se smooth animation */}
      <div
        className={`grid transition-all duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-gold-100 px-4 pb-5 pt-4 sm:px-5">
            <div className="rounded-2xl bg-gold-50/70 p-4 text-sm leading-relaxed text-neutral-700 [overflow-wrap:anywhere] sm:p-5">
              <p className="whitespace-pre-wrap">{m.message}</p>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-gold-100 p-3">
                <UserRound size={16} className="shrink-0 text-gold-600" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    Name
                  </dt>
                  <dd className="truncate font-semibold text-royal">
                    {m.name}
                  </dd>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-gold-100 p-3">
                <Mail size={16} className="shrink-0 text-gold-600" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    Email
                  </dt>
                  <dd className="font-semibold text-royal [overflow-wrap:anywhere]">
                    {m.email}
                  </dd>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-gold-100 p-3">
                <Phone size={16} className="shrink-0 text-gold-600" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    Phone
                  </dt>
                  <dd className="font-semibold text-royal [overflow-wrap:anywhere]">
                    {m.phone || "Not given"}
                  </dd>
                </div>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-neutral-400">
              Received {fullDate(m.created_at)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${m.email}?subject=${replySubject}`}
                onClick={() => m.status !== "replied" && onStatus(m, "replied")}
                className="btn-gold !px-4 !py-2.5 text-sm"
              >
                <Mail size={15} /> Reply by email
              </a>
              {m.phone && (
                <a
                  href={tel(m.phone)}
                  className="inline-flex items-center gap-2 rounded-full border border-gold-300 px-4 py-2.5 text-sm font-semibold text-royal transition hover:-translate-y-0.5 hover:bg-gold-50"
                >
                  <Phone size={15} /> Call
                </a>
              )}
              {waNum.length >= 8 && (
                <a
                  href={`https://wa.me/${waNum}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold-300 px-4 py-2.5 text-sm font-semibold text-royal transition hover:-translate-y-0.5 hover:bg-gold-50"
                >
                  <MessageCircle size={15} /> WhatsApp
                  <ArrowUpRight size={13} />
                </a>
              )}
              <span className="flex-1" />
              {m.status !== "replied" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onStatus(m, "replied")}
                  className="inline-flex items-center gap-2 rounded-full border border-gold-300 px-4 py-2.5 text-sm font-semibold text-royal transition hover:-translate-y-0.5 hover:bg-gold-50 disabled:opacity-50"
                >
                  <CheckCheck size={15} /> Mark replied
                </button>
              )}
              {m.status !== "new" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onStatus(m, "new")}
                  className="inline-flex items-center gap-2 rounded-full border border-gold-300 px-4 py-2.5 text-sm font-semibold text-royal transition hover:-translate-y-0.5 hover:bg-gold-50 disabled:opacity-50"
                >
                  <MailOpen size={15} /> Mark unread
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete(m)}
                aria-label="Delete message"
                title="Delete message"
                className="grid h-10 w-10 place-items-center rounded-full border border-red-200 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminContacts() {
  const toast = useToast();
  const sc = useAdminScope();
  const [rows, setRows] = useState([]);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setSpin(true);
      try {
        const r = await api("/admin/contacts");
        setRows(r.messages || []);
        setWarning(r.warning || "");
      } catch (e) {
        if (!quiet) toast(e.message, "err");
      } finally {
        setLoading(false);
        setSpin(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load(true);
    // Live: har 15 sec baad naye messages aa jayen
    const t = setInterval(() => load(true), 15000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (m, status) => {
    setBusyId(m.id);
    try {
      const r = await api(`/admin/contacts/${m.id}`, json("PATCH", { status }));
      setRows((rs) => rs.map((x) => (x.id === m.id ? r.message : x)));
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setBusyId(null);
    }
  };

  const del = async (m) => {
    if (
      !window.confirm(`Delete message from "${m.name}"? This cannot be undone.`)
    )
      return;
    setBusyId(m.id);
    try {
      await api(`/admin/contacts/${m.id}`, { method: "DELETE" });
      setRows((rs) => rs.filter((x) => x.id !== m.id));
      toast("Message deleted");
    } catch (e) {
      toast(e.message, "err");
    } finally {
      setBusyId(null);
    }
  };

  const toggle = (m) => {
    const willOpen = openId !== m.id;
    setOpenId(willOpen ? m.id : null);
    // Khulte hi "new" message read ho jata hai
    if (willOpen && m.status === "new") setStatus(m, "read");
  };

  const counts = useMemo(
    () => ({
      all: rows.length,
      new: rows.filter((r) => r.status === "new").length,
      read: rows.filter((r) => r.status === "read").length,
      replied: rows.filter((r) => r.status === "replied").length,
    }),
    [rows],
  );

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.name, r.email, r.phone, r.topic, r.message].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      );
    });
  }, [rows, filter, search]);

  const chips = [
    ["all", "All"],
    ["new", "New"],
    ["read", "Read"],
    ["replied", "Replied"],
  ];

  return (
    <div className="space-y-6">
      <ShopContact sc={sc} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          icon={Inbox}
          label="Total messages"
          value={counts.all}
          tone="bg-royal text-white"
        />
        <Stat
          icon={Mail}
          label="New"
          value={counts.new}
          tone="bg-gold-500 text-white"
        />
        <Stat
          icon={MailOpen}
          label="Read"
          value={counts.read}
          tone="bg-gold-100 text-gold-700"
        />
        <Stat
          icon={CheckCheck}
          label="Replied"
          value={counts.replied}
          tone="bg-royal-soft text-royal"
        />
      </div>

      <div className="rounded-[28px] border border-gold-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {chips.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition sm:text-sm ${filter === k ? "gold-bg border-transparent text-white shadow-md" : "border-gold-200 text-neutral-600 hover:bg-gold-50"}`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 text-[11px] ${filter === k ? "bg-white/25" : "bg-gold-100 text-gold-700"}`}
                >
                  {counts[k]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex min-w-0 gap-2 lg:w-[380px]">
            <label className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, message…"
                className="w-full rounded-full border border-gold-200 bg-gold-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-200/60"
              />
            </label>
            <button
              type="button"
              onClick={() => load(false)}
              aria-label="Refresh"
              title="Refresh"
              className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border border-gold-200 text-royal transition hover:bg-gold-50"
            >
              <RefreshCw size={16} className={spin ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {warning && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {warning}
          </div>
        )}

        <div className="mt-5 space-y-3 sm:space-y-4">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-3xl bg-gold-50"
              />
            ))
          ) : shown.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-gold-300 bg-gold-50/50 px-6 py-14 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-gold-600 shadow-lg">
                <Inbox size={26} />
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-royal">
                {rows.length ? "No matching messages" : "No messages yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                {rows.length
                  ? "Filter ya search badal kar dekhein."
                  : `Jab bhi koi customer ${sc.brand} ke Contact page se message bhejega, yahan live aa jayega.`}
              </p>
            </div>
          ) : (
            shown.map((m) => (
              <MessageCard
                key={m.id}
                m={m}
                open={openId === m.id}
                onToggle={() => toggle(m)}
                onStatus={setStatus}
                onDelete={del}
                busy={busyId === m.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
