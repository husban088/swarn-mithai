import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from "lucide-react";
import { Thumb } from "./ProductCard";
import { useGeo, useShop } from "../store";
import { brandFor } from "../config";

// Cart sidebar: add to cart par khud khulta hai. Qty badalne ya delete karne par
// cart details par gol (round) loader ghoomta hai.
export default function CartDrawer() {
  const {
    drawer,
    setDrawer,
    lines,
    total,
    count,
    setQty,
    remove,
    cartBusy,
    flash,
  } = useShop();
  const { fmt, country } = useGeo();
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (drawer) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 320);
    return () => clearTimeout(t);
  }, [drawer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cart / Checkout page par drawer band
  useEffect(() => {
    if (pathname === "/cart" || pathname === "/checkout") setDrawer(false);
  }, [pathname, setDrawer]);

  // Escape se band + page scroll lock
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mounted, setDrawer]);

  if (!mounted) return null;
  const close = () => setDrawer(false);

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className={`absolute inset-0 bg-royal-deep/60 backdrop-blur-sm ${closing ? "animate-fadeOut" : "animate-pop"}`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl ${closing ? "animate-slideOut" : "animate-slideIn"}`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-royal px-6 py-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-champ-400/30 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-champ-300">
                {brandFor(country.code).name}
              </span>
              <h3 className="font-display text-3xl font-bold text-champ-100">
                Your cart
                {count > 0 && (
                  <span className="ml-2 align-middle text-sm font-semibold text-champ-300">
                    ({count} {count === 1 ? "item" : "items"})
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={close}
              aria-label="Close cart"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition duration-300 hover:rotate-90 hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>
          <div className="hairline absolute inset-x-0 bottom-0" />
        </div>

        {/* Body (loader overlay yahan ghoomta hai) */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {lines.length === 0 && (
              <div className="grid h-full place-items-center text-center">
                <div className="animate-fadeUp">
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-champ-300 bg-champ-100/50 text-champ-600">
                    <ShoppingBag size={34} />
                  </span>
                  <p className="mt-4 font-display text-3xl font-bold text-royal">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Add something to begin.
                  </p>
                  <Link to="/shop" onClick={close} className="btn-gold mt-6">
                    Browse products
                  </Link>
                </div>
              </div>
            )}
            {lines.map((l, i) => (
              <div
                key={l.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`group flex animate-rowIn gap-4 rounded-2xl border bg-white p-3 transition duration-500 hover:border-champ-300 hover:shadow-lg hover:shadow-champ-200/40 ${flash === l.id ? "animate-flash border-champ-400" : "border-gold-100"}`}
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Thumb p={l.product} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xl font-bold text-royal">
                    {l.product.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {l.product.unit} · {fmt(l.product.price)}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-gold-200 bg-white">
                      <button
                        onClick={() => setQty(l.id, l.qty - 1)}
                        aria-label="Decrease"
                        className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-champ-100 active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        key={l.qty}
                        className="w-6 animate-pop text-center text-sm font-bold"
                      >
                        {l.qty}
                      </span>
                      <button
                        onClick={() => setQty(l.id, l.qty + 1)}
                        aria-label="Increase"
                        className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-champ-100 active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-royal">
                      {fmt(l.qty * l.product.price)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => remove(l.id)}
                  aria-label="Remove"
                  className="self-start rounded-full p-1.5 text-neutral-400 transition duration-300 hover:rotate-12 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {lines.length > 0 && (
            <div className="border-t border-champ-200 bg-gradient-to-b from-white to-champ-100/30 p-6">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  Subtotal ({country.currency})
                </span>
                <span
                  key={total}
                  className="animate-pop text-2xl font-extrabold text-royal"
                >
                  {fmt(total)}
                </span>
              </div>
              <p className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
                <ShieldCheck size={13} className="text-champ-500" />
                No account needed · Pay on delivery
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cart"
                  onClick={close}
                  className="btn-line w-full !py-3.5"
                >
                  View cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="btn-gold w-full !py-3.5"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}

          {/* Round loader */}
          {cartBusy && (
            <div className="absolute inset-0 z-10 grid animate-pop place-items-center bg-white/75 backdrop-blur-[2px]">
              <div className="text-center">
                <div className="ring-loader mx-auto" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-champ-600">
                  Updating
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
