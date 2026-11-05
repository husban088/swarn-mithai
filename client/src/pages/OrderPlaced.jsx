import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  StickyNote,
  User,
} from "lucide-react";
import { api, json } from "../lib/api";
import { fmtDate, fmtMoney, normStatus, shortId } from "../lib/format";
import { PAYMENT_LABELS, STATUS_STYLE } from "../config";
import { useShop } from "../store";

const STEPS = ["pending", "processing", "shipped", "delivered"];

function Progress({ status }) {
  if (status === "cancelled")
    return (
      <p className="text-sm font-semibold text-red-600">
        This order was cancelled.
      </p>
    );
  const at = Math.max(0, STEPS.indexOf(status));
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${i <= at ? "gold-bg" : "bg-gold-100"}`}
          />
          <span
            className={`text-[10px] font-semibold capitalize sm:text-xs ${i <= at ? "text-royal" : "text-neutral-400"}`}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

function Info({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-champ-100/70 text-champ-600">
        <Icon size={16} />
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

export default function OrderPlaced() {
  const { id } = useParams();
  const { clear } = useShop();
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
  const money = (n) => fmtMoney(n, order.currency);

  return (
    <div className="container-x py-10 sm:py-14">
      {/* Success header */}
      <div className="mx-auto max-w-2xl animate-fadeUp text-center">
        <span className="relative mx-auto grid h-24 w-24 place-items-center rounded-full champ-bg text-royal shadow-xl shadow-champ-300/50">
          <span className="absolute inset-0 animate-flash rounded-full" />
          <CheckCircle2 size={46} />
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold text-royal sm:text-6xl">
          Order placed
        </h1>
        <p className="mt-3 text-neutral-600">
          Thank you{c.name ? `, ${c.name}` : ""}! Your order{" "}
          <b className="text-royal">#{shortId(order.id)}</b> is confirmed.{" "}
          {order.customer?.email
            ? "We sent the details to your email."
            : "Please note your order number. We will contact you on your phone."}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left: items + total + progress */}
        <div className="space-y-6">
          <section className="card-lux p-5 hover:translate-y-0 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Order number
                </div>
                <div className="font-display text-3xl font-bold text-royal">
                  #{shortId(order.id)}
                </div>
                <div className="text-xs text-neutral-500">
                  Placed on {fmtDate(order.created_at)}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[st] || STATUS_STYLE.pending}`}
              >
                {st}
              </span>
            </div>

            <h2 className="mt-6 flex items-center gap-2 font-display text-2xl font-bold text-royal">
              <Package size={20} className="text-gold-600" />
              Items ({(order.items || []).reduce((n, i) => n + i.qty, 0)})
            </h2>
            <div className="mt-3 divide-y divide-gold-100">
              {(order.items || []).map((i) => (
                <div
                  key={`${i.id}~${i.variant || ""}`}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-royal">{i.name}</div>
                    <div className="text-xs text-neutral-500">
                      {i.unit} · {money(i.price)} × {i.qty}
                    </div>
                  </div>
                  <div className="shrink-0 font-bold text-royal">
                    {money(i.price * i.qty)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-2 border-t border-champ-200 pt-4 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{money(order.total)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-royal">
                <span>Total {cod ? "(to pay on delivery)" : "(paid)"}</span>
                <span>{money(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="card-lux p-5 hover:translate-y-0 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-royal">
              Order progress
            </h2>
            <div className="mt-4">
              <Progress status={st} />
            </div>
          </section>
        </div>

        {/* Right: shipping + payment */}
        <div className="space-y-6">
          <section className="card-lux space-y-4 p-5 hover:translate-y-0 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-royal">
              Shipping details
            </h2>
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
          </section>

          <section className="card-lux space-y-4 p-5 hover:translate-y-0 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-royal">
              Payment
            </h2>
            <Info icon={CreditCard} label="Method">
              {PAYMENT_LABELS[order.payment_method] || "Cash on delivery"}
            </Info>
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  order.payment_status === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gold-100 text-gold-700"
                }`}
              >
                {order.payment_status === "paid"
                  ? order.payment_method === "bank"
                    ? "Paid · receipt received"
                    : "Paid"
                  : "Pay when it arrives"}
              </span>
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col justify-center gap-3 sm:flex-row print:hidden">
        <Link to="/shop" className="btn-gold">
          Continue shopping
        </Link>
        <button onClick={() => window.print()} className="btn-line">
          <Printer size={16} />
          Print receipt
        </button>
      </div>
    </div>
  );
}
