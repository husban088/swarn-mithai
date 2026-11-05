import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Copy,
  ImagePlus,
  MessageCircle,
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import PageHero from "../components/PageHero";
import { Thumb } from "../components/ProductCard";
import { api, json } from "../lib/api";
import { BANK, ONLINE_PAYMENTS } from "../config";
import { fmtMoney } from "../lib/format";
import FieldError, { errCls } from "../components/FieldError";
import {
  vAddress,
  vCity,
  vEmail,
  vName,
  vPhone,
  vPostal,
} from "../lib/validate";
import { useAuth, useGeo, useShop, useToast } from "../store";

export default function Checkout() {
  const { country, fmt } = useGeo();
  const { user } = useAuth();
  const { lines, total, clear, loading } = useShop();
  const toast = useToast();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState("cod");
  // Bank transfer (Mithai House): receipt image lazmi
  const [receipt, setReceipt] = useState({ url: "", preview: "", name: "" });
  const [rcUp, setRcUp] = useState(false);
  const [rcOk, setRcOk] = useState(false);
  const rcRef = useRef(null);
  const [cfg, setCfg] = useState({
    cod: true,
    stripe: false,
    paypal: false,
    pkrPerUsd: 280,
  });
  const [f, setF] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    postal: "",
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  // Har input zaruri hai. Jab tak sab sahi na ho order place nahi hota.
  const errs = {
    name: vName(f.name),
    phone: vPhone(f.phone, true),
    email: vEmail(f.email),
    address: vAddress(f.address),
    city: vCity(f.city),
    postal: vPostal(f.postal),
  };
  const hasErr = Object.values(errs).some(Boolean);
  // Foran dikhao: type karte hi, field se bahar jate hi, ya order dabane par
  const msg = (k) =>
    submitted || touched[k] || f[k].length > 0 ? errs[k] : "";

  // Kaun kaun si payment methods server par set hain
  useEffect(() => {
    api("/payments/config")
      .then(setCfg)
      .catch(() => {});
  }, []);

  // Gateway se cancel karke wapas aaye
  const told = useRef(false);
  useEffect(() => {
    if (params.get("payment") === "cancelled" && !told.current) {
      told.current = true;
      toast("Payment was cancelled. You can try again.", "err");
      setParams({}, { replace: true });
    }
  }, [params, setParams, toast]);

  // Gateway se back dabane par button atka na rahe
  useEffect(() => {
    const on = (e) => e.persisted && setBusy(false);
    window.addEventListener("pageshow", on);
    return () => window.removeEventListener("pageshow", on);
  }, []);

  const pickReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (rcRef.current) rcRef.current.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type))
      return toast("Receipt must be a JPG, PNG or WEBP image.", "err");
    if (file.size > 10 * 1024 * 1024)
      return toast("Receipt image must be smaller than 10 MB.", "err");
    setRcUp(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await api("/upload/receipt", { method: "POST", body: fd });
      setReceipt({ url: r.url, preview: URL.createObjectURL(file), name: file.name });
      toast("Receipt uploaded.");
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setRcUp(false);
    }
  };
  const clearReceipt = () => {
    setReceipt({ url: "", preview: "", name: "" });
    setRcOk(false);
  };
  const copyAcc = async () => {
    try {
      await navigator.clipboard.writeText(BANK.account);
      toast("Account number copied.");
    } catch {
      toast("Please copy the account number manually.", "err");
    }
  };

  const place = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErr) {
      const first = ["name", "phone", "email", "address", "city", "postal"].find(
        (k) => errs[k],
      );
      document.getElementById(`c-${first === "address" ? "addr" : first}`)?.focus();
      return;
    }
    if (pay === "bank") {
      if (!receipt.url) {
        toast(
          "Please upload your payment receipt first. Your order cannot be placed without it.",
          "err",
        );
        document.getElementById("c-receipt")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (!rcOk) return toast("Please confirm that your receipt is correct.", "err");
    }
    if (pay === "stripe" && !cfg.stripe)
      return toast("Card payment is not available yet.", "err");
    if (pay === "paypal" && !cfg.paypal)
      return toast("PayPal is not available yet.", "err");
    setBusy(true);
    try {
      const r = await api(
        "/orders",
        json("POST", {
          country: country.code,
          items: lines.map((l) => ({ id: l.pid || l.id, v: l.v, qty: l.qty })),
          customer: {
            name: f.name.trim(),
            phone: f.phone.trim(),
            email: f.email.trim(),
            address: f.address.trim(),
            city: f.city.trim(),
            postal: f.postal.trim(),
          },
          payment_method: pay,
          ...(pay === "bank" ? { receipt_url: receipt.url } : {}),
          origin: window.location.origin,
        }),
      );
      if (r.redirect_url) {
        // Stripe / PayPal ka page. Cart payment confirm hone ke baad clear hoga.
        window.location.href = r.redirect_url;
        return;
      }
      clear();
      nav(`/order-placed/${r.order.id}`, { replace: true });
    } catch (err) {
      toast(err.message, "err");
      setBusy(false);
    }
  };

  if (loading && !lines.length) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16">
        <div className="ring-loader" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div className="animate-fadeUp">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-champ-300 bg-champ-100/50 text-champ-600">
            <ShoppingBag size={42} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold text-royal sm:text-5xl">
            Nothing to checkout
          </h1>
          <p className="mt-2 text-neutral-500">Your cart is empty.</p>
          <Link to="/shop" className="btn-gold mt-7">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const allMethods = [
    {
      key: "cod",
      icon: Banknote,
      title: country.code === "PK" ? "Cash on delivery" : "Pay on delivery",
      text: "Pay in cash when your order arrives.",
      ok: true,
    },
    {
      key: "stripe",
      icon: CreditCard,
      title: "Credit / Debit card",
      text: "Secure card payment powered by Stripe.",
      ok: cfg.stripe,
    },
    {
      key: "paypal",
      icon: Wallet,
      title: "PayPal",
      text: "Pay with your PayPal account or card.",
      ok: cfg.paypal,
    },
  ];
  // Mithai House (USA): bank transfer (Citibank) bhi, receipt upload ke saath
  if (country.code === "US")
    allMethods.push({
      key: "bank",
      icon: Building2,
      title: `Bank transfer (${BANK.bank})`,
      text: "Pay to our Citibank account and upload your payment receipt.",
      ok: true,
    });
  // Cash on delivery + bank. Online payments config.js me ONLINE_PAYMENTS se chalu hongi
  const methods = ONLINE_PAYMENTS
    ? allMethods
    : allMethods.filter((m) => m.key === "cod" || m.key === "bank");
  const bankBlocked = pay === "bank" && (!receipt.url || !rcOk);
  const waText = encodeURIComponent(
    `Hello, I have paid by bank transfer (Citibank). Here is my payment receipt. Name: ${f.name || ""}`,
  );
  const usd = total / (cfg.pkrPerUsd || 280);

  return (
    <div>
      <PageHero
        eyebrow="Secure checkout"
        title="Checkout"
        crumb="Checkout"
        text="No account needed. Add your shipping details, choose how to pay and place your order."
      />
      <form
        onSubmit={place}
        noValidate
        className="container-x grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.35fr_1fr]"
      >
        {/* Left: shipping + payment */}
        <div className="space-y-6">
          <section className="card-lux space-y-4 p-5 hover:translate-y-0 sm:p-7">
            <h2 className="font-display text-3xl font-bold text-royal">
              Shipping details
            </h2>
            {!user && (
              <p className="flex items-center gap-2 rounded-xl bg-champ-100/60 px-3 py-2 text-xs text-royal">
                <ShieldCheck size={14} className="shrink-0 text-champ-600" />
                <span>
                  Guest checkout, no account needed.{" "}
                  <Link to="/login" className="font-bold underline">
                    Sign in
                  </Link>{" "}
                  if you have one.
                </span>
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="c-name">
                  Full name
                </label>
                <input
                  id="c-name"
                  className={`field ${errCls(msg("name"))}`}
                  value={f.name}
                  onChange={set("name")}
                  onBlur={blur("name")}
                  autoComplete="name"
                  aria-invalid={msg("name") ? "true" : undefined}
                />
                <FieldError msg={msg("name")} />
              </div>
              <div>
                <label className="label" htmlFor="c-phone">
                  Phone
                </label>
                <input
                  id="c-phone"
                  className={`field ${errCls(msg("phone"))}`}
                  value={f.phone}
                  onChange={set("phone")}
                  onBlur={blur("phone")}
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={msg("phone") ? "true" : undefined}
                />
                <FieldError msg={msg("phone")} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="c-email">
                Email
              </label>
              <input
                id="c-email"
                type="email"
                className={`field ${errCls(msg("email"))}`}
                value={f.email}
                onChange={set("email")}
                onBlur={blur("email")}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={msg("email") ? "true" : undefined}
              />
              <FieldError msg={msg("email")} />
            </div>
            <div>
              <label className="label" htmlFor="c-addr">
                Delivery address
              </label>
              <input
                id="c-addr"
                className={`field ${errCls(msg("address"))}`}
                value={f.address}
                onChange={set("address")}
                onBlur={blur("address")}
                autoComplete="street-address"
                aria-invalid={msg("address") ? "true" : undefined}
              />
              <FieldError msg={msg("address")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="c-city">
                  City
                </label>
                <input
                  id="c-city"
                  className={`field ${errCls(msg("city"))}`}
                  value={f.city}
                  onChange={set("city")}
                  onBlur={blur("city")}
                  autoComplete="address-level2"
                  aria-invalid={msg("city") ? "true" : undefined}
                />
                <FieldError msg={msg("city")} />
              </div>
              <div>
                <label className="label" htmlFor="c-postal">
                  Postal code
                </label>
                <input
                  id="c-postal"
                  className={`field ${errCls(msg("postal"))}`}
                  value={f.postal}
                  onChange={set("postal")}
                  onBlur={blur("postal")}
                  autoComplete="postal-code"
                  aria-invalid={msg("postal") ? "true" : undefined}
                />
                <FieldError msg={msg("postal")} />
              </div>
            </div>
          </section>

          <section className="card-lux space-y-3 p-5 hover:translate-y-0 sm:p-7">
            <h2 className="font-display text-3xl font-bold text-royal">
              Payment method
            </h2>
            <div
              className="space-y-3"
              role="radiogroup"
              aria-label="Payment method"
            >
              {methods.map((m) => {
                const on = pay === m.key;
                return (
                  <label
                    key={m.key}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition duration-300 sm:items-center sm:gap-4 ${
                      m.ok ? "cursor-pointer" : "cursor-not-allowed opacity-55"
                    } ${on ? "border-champ-400 bg-champ-100/50 shadow-md shadow-champ-200/50" : "border-gold-200 hover:border-champ-300"}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      value={m.key}
                      checked={on}
                      disabled={!m.ok}
                      onChange={() => setPay(m.key)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#0a3a78] sm:mt-0"
                    />
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-royal text-champ-200">
                      <m.icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-royal">
                        {m.title}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {m.ok ? m.text : "Not available right now."}
                      </span>
                    </span>
                    {on && (
                      <CheckCircle2
                        size={20}
                        className="hidden shrink-0 text-champ-600 sm:block"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {pay === "bank" && (
              <div className="space-y-4 rounded-2xl border border-champ-300 bg-champ-100/40 p-4 sm:p-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-royal">
                    Pay to this account
                  </div>
                  <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                    <dt className="text-neutral-500">Bank</dt>
                    <dd className="font-semibold text-royal">{BANK.bank}</dd>
                    <dt className="text-neutral-500">Account number</dt>
                    <dd className="flex items-center gap-2 font-semibold text-royal">
                      {BANK.account}
                      <button
                        type="button"
                        onClick={copyAcc}
                        aria-label="Copy account number"
                        className="grid h-7 w-7 place-items-center rounded-full border border-champ-300 text-champ-600 transition hover:bg-white"
                      >
                        <Copy size={13} />
                      </button>
                    </dd>
                    <dt className="text-neutral-500">Account owner</dt>
                    <dd className="font-semibold text-royal">{BANK.holder}</dd>
                    <dt className="text-neutral-500">Amount</dt>
                    <dd className="font-semibold text-royal">{fmt(total)}</dd>
                  </dl>
                </div>

                <p className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold leading-relaxed text-royal ring-1 ring-champ-300">
                  After you pay, you must send your payment receipt to us on
                  WhatsApp. Your order will not be placed until you upload the
                  receipt image below.
                </p>

                <a
                  href={`https://wa.me/${BANK.whatsapp}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-line w-full !py-3 sm:w-auto"
                >
                  <MessageCircle size={17} />
                  Send receipt on WhatsApp ({BANK.whatsappLabel})
                </a>

                <div id="c-receipt">
                  <div className="label">Upload your payment receipt (required)</div>
                  <input
                    ref={rcRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    id="c-receipt-file"
                    onChange={pickReceipt}
                  />
                  {receipt.url ? (
                    <div className="flex items-center gap-3 rounded-xl border border-champ-300 bg-white p-2.5">
                      <img
                        src={receipt.preview || receipt.url}
                        alt="Payment receipt"
                        className="h-20 w-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="flex items-center gap-1.5 font-semibold text-royal">
                          <CheckCircle2 size={16} className="text-champ-600" />
                          Receipt uploaded
                        </div>
                        <div className="truncate text-xs text-neutral-500">
                          {receipt.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearReceipt}
                        aria-label="Remove receipt"
                        className="grid h-8 w-8 place-items-center rounded-full border border-gold-200 text-neutral-500 transition hover:bg-champ-100"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="c-receipt-file"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-champ-300 bg-white px-4 py-6 text-sm font-semibold text-royal transition hover:border-champ-500"
                    >
                      {rcUp ? (
                        <>
                          <span className="ring-loader ring-loader-sm" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <ImagePlus size={18} />
                          Choose receipt image (JPG, PNG or WEBP)
                        </>
                      )}
                    </label>
                  )}
                  <p className="mt-2 text-xs text-neutral-500">
                    Upload the real {BANK.bank} receipt of this payment. It must
                    clearly show the bank ({BANK.bank}), the account number{" "}
                    <b>{BANK.account}</b> and the account owner name{" "}
                    <b>{BANK.holder}</b>. Other images will be rejected and the
                    order cancelled.
                  </p>
                  <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs text-royal">
                    <input
                      type="checkbox"
                      checked={rcOk}
                      disabled={!receipt.url}
                      onChange={(e) => setRcOk(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#0a3a78]"
                    />
                    <span>
                      I confirm this receipt is for my payment of{" "}
                      <b>{fmt(total)}</b> to {BANK.bank} account {BANK.account}{" "}
                      ({BANK.holder}).
                    </span>
                  </label>
                </div>
              </div>
            )}
            {pay === "paypal" && country.code === "PK" && (
              <p className="rounded-xl bg-gold-50 px-3 py-2 text-xs text-neutral-600">
                PayPal does not support PKR, so you will be charged about{" "}
                <b>{fmtMoney(usd, "USD")}</b> (rate: {cfg.pkrPerUsd} PKR per
                USD).
              </p>
            )}
            {pay !== "cod" && pay !== "bank" && (
              <p className="flex items-center gap-2 text-xs text-neutral-500">
                <Lock size={13} className="text-champ-600" />
                You will be redirected to a secure page to complete the payment.
              </p>
            )}
          </section>
        </div>

        {/* Right: order summary */}
        <aside className="relative h-fit overflow-hidden rounded-3xl border border-champ-300 bg-gradient-to-b from-white to-champ-100/40 p-5 shadow-2xl shadow-champ-200/40 sm:p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-3xl font-bold text-royal">
            Order summary
          </h2>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Thumb p={l.product} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-royal">
                    {l.product.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {l.product.unit} × {l.qty}
                  </div>
                </div>
                <div className="text-sm font-bold text-royal">
                  {fmt(l.qty * l.product.price)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-champ-200 pt-4">
            <span className="text-sm text-neutral-600">
              Total ({country.currency})
            </span>
            <span className="text-3xl font-extrabold text-royal">
              {fmt(total)}
            </span>
          </div>
          <button
            disabled={busy || rcUp || bankBlocked}
            className="btn-gold mt-5 w-full !py-3.5"
          >
            {(busy || rcUp) && <span className="ring-loader ring-loader-sm" />}
            {busy
              ? pay === "cod" || pay === "bank"
                ? "Placing order…"
                : "Redirecting…"
              : rcUp
                ? "Uploading receipt…"
                : pay === "cod" || pay === "bank"
                  ? `Place order · ${fmt(total)}`
                  : `Pay now · ${fmt(total)}`}
          </button>
          {pay === "bank" && bankBlocked && (
            <p className="mt-3 text-center text-xs font-semibold text-royal">
              {receipt.url
                ? "Tick the confirmation under your receipt to place your order."
                : "Upload your payment receipt to place your order."}
            </p>
          )}
          {submitted && hasErr && (
            <p
              role="alert"
              className="mt-3 text-center text-xs font-medium text-red-600"
            >
              Please fill in all the details marked in red to place your order.
            </p>
          )}
          <Link to="/cart" className="btn-line mt-2 w-full !py-3">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
