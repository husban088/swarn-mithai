import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  Gift,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Printer,
  ShoppingBag,
  Sparkles,
  StickyNote,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { api, json } from "../lib/api";
import { fmtDate, fmtMoney, normStatus, shortId } from "../lib/format";
import {
  BRANDS,
  COUNTRIES,
  PAYMENT_LABELS,
  SHOP_INFO,
  STATUS_STYLE,
} from "../config";
import Thumb from "../components/Thumb";
import { useShop, useToast } from "../store";

const STEPS = [
  { key: "pending", label: "Order placed", icon: ClipboardCheck },
  { key: "processing", label: "Preparing", icon: Package },
  { key: "shipped", label: "On the way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

// Order ki halat: 4 step ki luxury timeline (mobile par seedhi, bari screen par aadi)
function Timeline({ status }) {
  if (status === "cancelled")
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        This order was cancelled.
      </p>
    );
  const at = Math.max(
    0,
    STEPS.findIndex((x) => x.key === status),
  );
  const pct = (at / (STEPS.length - 1)) * 100;
  return (
    <div>
      {/* bari screen */}
      <div className="relative hidden sm:block">
        <div className="absolute left-[12.5%] right-[12.5%] top-6 h-1 rounded-full bg-gold-100">
          <div
            className="gold-bg h-full origin-left animate-lineGrow rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ol className="relative grid grid-cols-4">
          {STEPS.map((x, i) => {
            const Icon = x.icon;
            const done = i < at;
            const on = i === at;
            return (
              <li
                key={x.key}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span
                  className={`relative grid h-12 w-12 place-items-center rounded-full border-2 ${
                    done
                      ? "gold-bg border-transparent text-white"
                      : on
                        ? "border-champ-500 bg-white text-champ-600 shadow-lg shadow-champ-300/60"
                        : "border-gold-200 bg-white text-neutral-300"
                  }`}
                >
                  {on && (
                    <span className="absolute inset-0 animate-flash rounded-full" />
                  )}
                  {done ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <Icon size={18} />
                  )}
                </span>
                <span
                  className={`text-xs font-semibold ${done || on ? "text-royal" : "text-neutral-400"}`}
                >
                  {x.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {/* mobile */}
      <ol className="relative space-y-4 sm:hidden">
        <div className="absolute bottom-5 left-[19px] top-5 w-0.5 bg-gold-100" />
        {STEPS.map((x, i) => {
          const Icon = x.icon;
          const done = i < at;
          const on = i === at;
          return (
            <li key={x.key} className="relative flex items-center gap-3">
              <span
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${
                  done
                    ? "gold-bg border-transparent text-white"
                    : on
                      ? "border-champ-500 bg-white text-champ-600 shadow-lg shadow-champ-300/60"
                      : "border-gold-200 bg-white text-neutral-300"
                }`}
              >
                {done ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Icon size={16} />
                )}
              </span>
              <span
                className={`text-sm font-semibold ${done || on ? "text-royal" : "text-neutral-400"}`}
              >
                {x.label}
                {on && (
                  <span className="ml-2 rounded-full bg-champ-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-champ-600">
                    Now
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Info({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-champ-100/70 text-champ-600">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </div>
        <div className="break-words text-sm font-medium text-royal">
          {children}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-champ-200/70 bg-white shadow-xl shadow-champ-200/25 ${className}`}
    >
      <header className="flex items-center gap-3 border-b border-champ-100 bg-gradient-to-r from-champ-100/60 to-white px-5 py-4 sm:px-7">
        <span className="grid h-9 w-9 place-items-center rounded-full gold-bg text-white">
          <Icon size={16} />
        </span>
        <h2 className="font-display text-2xl font-bold text-royal">{title}</h2>
      </header>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

export default function OrderPlaced() {
  const { id } = useParams();
  const { clear } = useShop();
  const toast = useToast();
  const clearRef = useRef(clear);
  clearRef.current = clear;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  // Online payment ho to gateway se confirm karo, phir cart khali karo
  const load = useCallback(async () => {
    setError("");
    try {
      let { order: o } = await api(`/orders/${id}`);
      setNote("");
      if (o.payment_status === "awaiting") {
        const r = await api(`/orders/${id}/confirm`, json("POST", {}));
        o = r.order;
        if (r.message && o.payment_status === "awaiting") setNote(r.message);
      }
      setOrder(o);
      if (o.payment_status !== "awaiting") clearRef.current();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <div className="ring-loader mx-auto" />
          <p className="mt-4 text-sm font-semibold text-royal">
            Confirming your order…
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div className="max-w-md">
          <AlertCircle size={44} className="mx-auto text-red-500" />
          <h1 className="mt-4 font-display text-4xl font-bold text-royal">
            Order not found
          </h1>
          <p className="mt-2 text-neutral-500">
            {error || "We could not find this order."}
          </p>
          <Link to="/shop" className="btn-gold mt-6">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // Payment poori nahi hui
  if (order.payment_status === "awaiting") {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div className="max-w-md animate-fadeUp">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold-100 text-gold-700">
            <AlertCircle size={38} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold text-royal sm:text-5xl">
            Payment not completed
          </h1>
          <p className="mt-3 text-neutral-600">
            Order <b className="text-royal">#{shortId(order.id)}</b> is waiting
            for payment.{" "}
            {note || "If you already paid, tap Check again in a moment."}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => {
                setChecking(true);
                load();
              }}
              disabled={checking}
              className="btn-gold"
            >
              {checking && <span className="ring-loader ring-loader-sm" />}
              Check again
            </button>
            <Link to="/checkout" className="btn-line">
              Back to checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const c = order.customer || {};
  const st = normStatus(order.status);
  const cod = order.payment_method === "cod";
  const bank = order.payment_method === "bank";
  const money = (n) => fmtMoney(n, order.currency);
  const code = order.country === "PK" || order.currency === "PKR" ? "PK" : "US";
  const brand = BRANDS[code];
  const info = COUNTRIES[code];
  const items = order.items || [];
  const count = items.reduce((n, i) => n + (Number(i.qty) || 0), 0);
  const subtotal = items.reduce(
    (n, i) => n + (Number(i.price) || 0) * (Number(i.qty) || 0),
    0,
  );
  const total = Number(order.total) || subtotal;
  const num = shortId(order.id);
  const copyNum = async () => {
    try {
      await navigator.clipboard.writeText(num);
      toast("Order number copied.");
    } catch {
      toast("Please copy the order number manually.", "err");
    }
  };
  const next = [
    {
      icon: Mail,
      t: "Confirmation",
      d: c.email
        ? "We emailed your order number, cart and checkout details."
        : "Please note your order number. We will contact you by phone.",
    },
    {
      icon: Package,
      t: "We prepare it",
      d:
        code === "US"
          ? "Your mithai is freshly made and packed with care."
          : "Your order is packed fresh and sealed.",
    },
    {
      icon: Truck,
      t: code === "US" ? SHOP_INFO.delivery.title : "Delivery",
      d:
        code === "US"
          ? SHOP_INFO.delivery.note
          : "Cash on delivery across Pakistan.",
    },
  ];

  return (
    <div className="overflow-x-hidden bg-white">
      <style>{`
        @keyframes opDraw { from { stroke-dashoffset: 48 } to { stroke-dashoffset: 0 } }
        @keyframes opPop { 0% { transform: scale(.4); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes opTwinkle { 0%,100% { opacity: .15; transform: scale(.7) } 50% { opacity: 1; transform: scale(1.2) } }
        @keyframes opRing { 0% { transform: scale(.85); opacity: .55 } 100% { transform: scale(1.9); opacity: 0 } }
        .op-draw { stroke-dasharray: 48; stroke-dashoffset: 48; animation: opDraw .7s .5s cubic-bezier(.2,.7,.2,1) forwards }
        .op-pop { animation: opPop .7s cubic-bezier(.2,.8,.2,1) both }
        .op-tw { animation: opTwinkle 3.2s ease-in-out infinite }
        .op-ring { animation: opRing 2.8s ease-out infinite }
        @media print {
          .op-hero { background: #fff !important; color: #000 !important }
          .op-hero * { color: #000 !important; text-shadow: none !important }
          .op-noprint { display: none !important }
        }
        @media (prefers-reduced-motion: reduce) {
          .op-draw, .op-pop, .op-tw, .op-ring { animation: none !important; stroke-dashoffset: 0 }
        }
      `}</style>

      {/* ---------- Hero ---------- */}
      <div className="op-hero relative isolate overflow-hidden bg-gradient-to-b from-[#040405] via-[#0b1630] to-[#0a3a78] pb-28 pt-12 text-center sm:pb-32 sm:pt-16">
        <div className="op-noprint pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-champ-500/25 blur-3xl" />
        <div className="op-noprint pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-champ-300/20 blur-3xl" />
        {[
          "left-[8%] top-[22%]",
          "left-[18%] top-[62%]",
          "right-[10%] top-[28%]",
          "right-[20%] top-[66%]",
          "left-[44%] top-[10%]",
          "right-[40%] top-[78%]",
        ].map((p, i) => (
          <Sparkles
            key={p}
            size={i % 2 ? 14 : 20}
            className={`op-tw op-noprint pointer-events-none absolute text-champ-200 ${p}`}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
        <div className="container-x relative">
          <div className="relative mx-auto grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
            <span className="op-ring op-noprint absolute inset-0 rounded-full border border-champ-300/60" />
            <span
              className="op-ring op-noprint absolute inset-0 rounded-full border border-champ-300/40"
              style={{ animationDelay: "1.2s" }}
            />
            <span className="op-pop relative grid h-24 w-24 place-items-center rounded-full champ-bg text-royal shadow-2xl shadow-champ-500/50 sm:h-28 sm:w-28">
              <svg
                viewBox="0 0 24 24"
                className="h-12 w-12 sm:h-14 sm:w-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path className="op-draw" d="M5 12.5l4.2 4.2L19 7" />
              </svg>
            </span>
          </div>
          <div className="mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.32em] text-champ-300">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-champ-300" />
            Order confirmed
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-champ-300" />
          </div>
          <h1 className="mt-3 animate-fadeUp font-display text-5xl font-bold leading-[1.02] text-white sm:text-7xl">
            Thank you{c.name ? `, ${c.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mx-auto mt-4 max-w-xl px-2 text-sm leading-relaxed text-champ-100/85 sm:text-base">
            Your order is placed with <b className="text-white">{brand.name}</b>
            .{" "}
            {c.email
              ? "We sent all the details to your email."
              : "Please note your order number. We will contact you on your phone."}
          </p>
        </div>
      </div>

      {/* ---------- Order number ticket (hero ke upar overlap) ---------- */}
      <div className="container-x relative -mt-20 sm:-mt-24">
        <div className="mx-auto max-w-4xl animate-fadeUp overflow-hidden rounded-3xl border border-champ-200 bg-white shadow-2xl shadow-champ-500/20">
          <div className="gold-bg h-1.5" />
          <div className="grid gap-5 p-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center sm:gap-6 sm:p-7">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                Order number
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="gold-text break-all font-display text-4xl font-bold leading-none sm:text-5xl">
                  #{num}
                </span>
                <button
                  type="button"
                  onClick={copyNum}
                  aria-label="Copy order number"
                  className="op-noprint grid h-9 w-9 shrink-0 place-items-center rounded-full border border-champ-300 text-champ-600 transition hover:bg-champ-100"
                >
                  <Copy size={15} />
                </button>
              </div>
              <div className="mt-1.5 text-xs text-neutral-500">
                Placed on {fmtDate(order.created_at)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:contents">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  Total
                </div>
                <div className="mt-1 font-display text-3xl font-bold text-royal">
                  {money(total)}
                </div>
                <div className="text-xs text-neutral-500">
                  {count} item{count === 1 ? "" : "s"}
                </div>
              </div>
              <div className="sm:justify-self-end">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  Status
                </div>
                <span
                  className={`mt-1.5 inline-block rounded-full px-4 py-1.5 text-xs font-bold capitalize ${STATUS_STYLE[st] || STATUS_STYLE.pending}`}
                >
                  {st}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Timeline ---------- */}
      <div className="container-x mt-6 sm:mt-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-champ-200/70 bg-gradient-to-b from-white to-champ-100/30 p-5 sm:p-7">
          <Timeline status={st} />
        </div>
      </div>

      {/* ---------- Details ---------- */}
      <div className="container-x mt-6 sm:mt-8">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Cart / items */}
          <Card
            icon={ShoppingBag}
            title={`Your cart (${count})`}
            className="min-w-0"
          >
            <div className="divide-y divide-champ-100">
              {items.map((i) => (
                <div
                  key={`${i.id}~${i.variant || ""}`}
                  className="flex items-center gap-3 py-4 first:pt-0 sm:gap-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-champ-100 bg-champ-100/30 sm:h-20 sm:w-20">
                    <Thumb
                      p={{
                        name: i.name,
                        image_url: i.image,
                        category: i.category,
                      }}
                      zoom={false}
                      w={300}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="break-words font-semibold leading-snug text-royal">
                      {i.name}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {[i.variant_label, i.unit].filter(Boolean).join(" · ")}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {money(i.price)} × {i.qty}
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-bold text-royal">
                    {money((Number(i.price) || 0) * (Number(i.qty) || 0))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-2 border-t border-champ-200 pt-4 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{money(subtotal || total)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">Included</span>
              </div>
              <div className="flex items-end justify-between border-t border-dashed border-champ-300 pt-3">
                <span className="font-semibold text-royal">
                  Total {cod ? "(pay on delivery)" : "(paid)"}
                </span>
                <span className="font-display text-3xl font-bold leading-none text-royal">
                  {money(total)}
                </span>
              </div>
            </div>
          </Card>

          <div className="min-w-0 space-y-6">
            {/* Checkout details */}
            <Card icon={MapPin} title="Delivery details">
              <div className="space-y-4">
                <Info icon={User} label="Name">
                  {c.name}
                </Info>
                <Info icon={Phone} label="Phone">
                  {c.phone}
                </Info>
                {c.email && (
                  <Info icon={Mail} label="Email">
                    {c.email}
                  </Info>
                )}
                <Info icon={MapPin} label="Delivery address">
                  {c.address}
                  <br />
                  {c.city}
                  {c.postal ? ` ${c.postal}` : ""}
                </Info>
                {c.notes && (
                  <Info icon={StickyNote} label="Notes">
                    {c.notes}
                  </Info>
                )}
              </div>
            </Card>

            <Card icon={Wallet} title="Payment">
              <div className="space-y-4">
                <Info icon={CreditCard} label="Method">
                  {PAYMENT_LABELS[order.payment_method] || "Cash on delivery"}
                </Info>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                    order.payment_status === "paid"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gold-100 text-gold-700"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  {order.payment_status === "paid"
                    ? bank
                      ? "Paid · receipt received"
                      : "Paid"
                    : "Pay when it arrives"}
                </span>
                {bank && order.receipt_url && (
                  <a
                    href={order.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="op-noprint flex items-center gap-3 rounded-2xl border border-champ-200 bg-champ-100/30 p-2.5 transition hover:bg-champ-100/60"
                  >
                    <img
                      src={order.receipt_url}
                      alt="Payment receipt"
                      className="h-16 w-14 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <span className="text-xs font-semibold text-royal">
                      View uploaded receipt
                    </span>
                  </a>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ---------- What happens next ---------- */}
      <div className="container-x mt-6 sm:mt-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#040405] via-[#0b1630] to-[#0a3a78] p-6 text-white sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-champ-500/25 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-champ-300">
              <Gift size={14} />
              What happens next
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {next.map((n, i) => (
                <div key={n.t} className="flex gap-3.5 sm:block">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-champ-300/40 bg-white/10 text-champ-200">
                    <n.icon size={19} />
                  </span>
                  <div className="sm:mt-3">
                    <div className="font-display text-xl font-bold">
                      {i + 1}. {n.t}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-champ-100/80">
                      {n.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-2 border-t border-white/15 pt-5 text-sm text-champ-100/85 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Need help? Call{" "}
                <a
                  href={`tel:${info.phone.replace(/[^+\d]/g, "")}`}
                  className="font-bold text-white underline-offset-4 hover:underline"
                >
                  {info.phone}
                </a>
                {info.phone2 ? (
                  <>
                    {" "}
                    /{" "}
                    <a
                      href={`tel:${info.phone2.replace(/[^+\d]/g, "")}`}
                      className="font-bold text-white underline-offset-4 hover:underline"
                    >
                      {info.phone2}
                    </a>
                  </>
                ) : null}
              </span>
              <span className="font-display text-lg font-bold text-champ-200">
                {brand.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="container-x op-noprint mt-8 pb-14 sm:pb-20">
        <div className="mx-auto flex max-w-4xl flex-col justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="btn-gold !py-3.5 sm:min-w-[220px]">
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="btn-line !py-3.5 sm:min-w-[220px]"
          >
            <Printer size={16} />
            Print receipt
          </button>
        </div>
      </div>
    </div>
  );
}
